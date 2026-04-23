import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CreateAppointmentForClientDto } from './dto/create-appointment-for-client.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import {
  AppointmentStatus,
  Role,
  SessionType,
  PsychologistApprovalStatus,
} from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(clientUserId: string, dto: CreateAppointmentDto) {
    const client = await this.prisma.client.findUnique({ where: { userId: clientUserId } });
    if (!client) throw new ForbiddenException('Danışan profili bulunamadı');

    const psychologist = await this.prisma.psychologist.findUnique({
      where: { id: dto.psychologistId },
    });
    if (!psychologist) throw new NotFoundException('Psikolog bulunamadı');
    if (psychologist.approvalStatus !== PsychologistApprovalStatus.APPROVED) {
      throw new BadRequestException('Bu psikolog henüz onaylanmamış');
    }
    if (!psychologist.isAcceptingClients) {
      throw new BadRequestException('Bu psikolog şu an yeni danışan kabul etmiyor');
    }

    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (start >= end) throw new BadRequestException('Bitiş zamanı başlangıçtan sonra olmalı');
    if (start < new Date()) throw new BadRequestException('Geçmiş bir zamana randevu alınamaz');

    // Çakışma kontrolü (backend garantisi)
    const conflict = await this.prisma.appointment.findFirst({
      where: {
        psychologistId: dto.psychologistId,
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
        OR: [
          { startTime: { lt: end }, endTime: { gt: start } },
        ],
      },
    });
    if (conflict) throw new ConflictException('Bu zaman diliminde psikolog meşgul');

    const videoMeetingUrl =
      dto.sessionType === SessionType.ONLINE
        ? `https://meet.psikotakip.com/${uuidv4()}`
        : undefined;

    const appointment = await this.prisma.appointment.create({
      data: {
        clientId: client.id,
        psychologistId: dto.psychologistId,
        startTime: start,
        endTime: end,
        sessionType: dto.sessionType,
        notes: dto.notes,
        videoMeetingUrl,
      },
      include: {
        client: { include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } } },
        psychologist: { include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } } },
      },
    });

    await this.notificationsService.sendAppointmentNotification(appointment, 'APPOINTMENT_CREATED');
    await this.auditService.log({
      userId: clientUserId,
      action: 'CREATE',
      entity: 'Appointment',
      entityId: appointment.id,
    });

    return appointment;
  }

  async createForClient(psychologistUserId: string, dto: CreateAppointmentForClientDto) {
    const psychologist = await this.prisma.psychologist.findUnique({ where: { userId: psychologistUserId } });
    if (!psychologist) throw new ForbiddenException('Psikolog profili bulunamadı');

    const client = await this.prisma.client.findUnique({ where: { userId: dto.clientUserId } });
    if (!client) throw new NotFoundException('Danışan bulunamadı');

    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (start >= end) throw new BadRequestException('Bitiş zamanı başlangıçtan sonra olmalı');

    const conflict = await this.prisma.appointment.findFirst({
      where: {
        psychologistId: psychologist.id,
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
        OR: [{ startTime: { lt: end }, endTime: { gt: start } }],
      },
    });
    if (conflict) throw new ConflictException('Bu zaman diliminde psikolog meşgul');

    const videoMeetingUrl =
      dto.sessionType === SessionType.ONLINE
        ? `https://meet.psikotakip.com/${uuidv4()}`
        : undefined;

    const appointment = await this.prisma.appointment.create({
      data: {
        clientId: client.id,
        psychologistId: psychologist.id,
        startTime: start,
        endTime: end,
        sessionType: dto.sessionType,
        notes: dto.notes,
        videoMeetingUrl,
        status: AppointmentStatus.CONFIRMED,
      },
      include: {
        client: { include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } } },
        psychologist: { include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } } },
      },
    });

    await this.notificationsService.sendAppointmentNotification(appointment, 'APPOINTMENT_CREATED');
    await this.auditService.log({
      userId: psychologistUserId,
      action: 'CREATE',
      entity: 'Appointment',
      entityId: appointment.id,
      details: { createdBy: 'PSYCHOLOGIST' },
    });

    return appointment;
  }

  async findMyAppointments(userId: string, role: Role) {
    if (role === Role.CLIENT) {
      const client = await this.prisma.client.findUnique({ where: { userId } });
      if (!client) return [];
      return this.prisma.appointment.findMany({
        where: { clientId: client.id },
        include: {
          psychologist: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
        orderBy: { startTime: 'desc' },
      });
    }

    if (role === Role.PSYCHOLOGIST) {
      const p = await this.prisma.psychologist.findUnique({ where: { userId } });
      if (!p) return [];
      return this.prisma.appointment.findMany({
        where: { psychologistId: p.id },
        include: {
          client: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } } },
        },
        orderBy: { startTime: 'desc' },
      });
    }

    return [];
  }

  async findById(id: string, userId: string, role: Role) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        client: { include: { user: true } },
        psychologist: { include: { user: true } },
        sessionNote: true,
      },
    });
    if (!appointment) throw new NotFoundException('Randevu bulunamadı');

    if (role === Role.ADMIN) return appointment;

    if (role === Role.CLIENT) {
      const client = await this.prisma.client.findUnique({ where: { userId } });
      if (appointment.clientId !== client?.id) throw new ForbiddenException();
    }
    if (role === Role.PSYCHOLOGIST) {
      const p = await this.prisma.psychologist.findUnique({ where: { userId } });
      if (appointment.psychologistId !== p?.id) throw new ForbiddenException();
    }

    return appointment;
  }

  async updateStatus(id: string, dto: UpdateAppointmentDto, userId: string, role: Role) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw new NotFoundException('Randevu bulunamadı');

    if (role === Role.CLIENT) {
      const client = await this.prisma.client.findUnique({ where: { userId } });
      if (appointment.clientId !== client?.id) throw new ForbiddenException();
      if (dto.status !== AppointmentStatus.CANCELLED) throw new ForbiddenException('Danışan yalnızca iptal edebilir');

      // 24 saat kuralı
      const hoursUntilAppointment = (appointment.startTime.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilAppointment < 24) {
        throw new BadRequestException('Randevuya 24 saatten az kaldığı için iptal edilemez');
      }
    }

    if (role === Role.PSYCHOLOGIST) {
      const p = await this.prisma.psychologist.findUnique({ where: { userId } });
      if (appointment.psychologistId !== p?.id) throw new ForbiddenException();
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.cancellationNote && { cancellationNote: dto.cancellationNote }),
      },
      include: {
        client: { include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } } },
        psychologist: { include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } } },
      },
    });

    if (dto.status === AppointmentStatus.CONFIRMED || dto.status === AppointmentStatus.CANCELLED) {
      await this.notificationsService.sendAppointmentNotification(updated, `APPOINTMENT_${dto.status}`);
    }

    await this.auditService.log({
      userId,
      action: 'UPDATE',
      entity: 'Appointment',
      entityId: id,
      details: { newStatus: dto.status },
    });

    return updated;
  }

  async reschedule(id: string, dto: RescheduleAppointmentDto, clientUserId: string) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw new NotFoundException('Randevu bulunamadı');

    const client = await this.prisma.client.findUnique({ where: { userId: clientUserId } });
    if (appointment.clientId !== client?.id) throw new ForbiddenException();
    if (appointment.status !== AppointmentStatus.PENDING) {
      throw new BadRequestException('Yalnızca onay bekleyen randevular düzenlenebilir');
    }

    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (start >= end) throw new BadRequestException('Bitiş zamanı başlangıçtan sonra olmalı');
    if (start < new Date()) throw new BadRequestException('Geçmiş bir zamana randevu alınamaz');

    const conflict = await this.prisma.appointment.findFirst({
      where: {
        id: { not: id },
        psychologistId: appointment.psychologistId,
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
        OR: [{ startTime: { lt: end }, endTime: { gt: start } }],
      },
    });
    if (conflict) throw new ConflictException('Bu zaman diliminde psikolog meşgul');

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        startTime: start,
        endTime: end,
        ...(dto.sessionType && { sessionType: dto.sessionType }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: {
        client: { include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } } },
        psychologist: { include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } } },
      },
    });

    await this.notificationsService.sendAppointmentNotification(updated, 'APPOINTMENT_RESCHEDULED');
    return updated;
  }

  async getAvailableSlots(psychologistId: string, date: string) {
    const p = await this.prisma.psychologist.findUnique({ where: { id: psychologistId } });
    if (!p) throw new NotFoundException('Psikolog bulunamadı');

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const existing = await this.prisma.appointment.findMany({
      where: {
        psychologistId,
        startTime: { gte: dayStart, lte: dayEnd },
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      },
      select: { startTime: true, endTime: true },
    });

    return { psychologistId, date, bookedSlots: existing, sessionDurationMin: p.sessionDurationMin };
  }
}

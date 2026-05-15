import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EncryptionService } from '../../common/crypto/encryption.service';
import { UpdatePsychologistDto } from './dto/update-psychologist.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreatePsychologistDto } from './dto/create-psychologist.dto';
import { PsychologistApprovalStatus, Role, Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
    private readonly auditService: AuditService,
  ) {}

  async findAllPsychologists(approvalStatus?: PsychologistApprovalStatus) {
    return this.prisma.psychologist.findMany({
      where: approvalStatus ? { approvalStatus } : {},
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, isActive: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPsychologist(dto: CreatePsychologistDto, adminId: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Bu e-posta adresi zaten kayıtlı');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: Role.PSYCHOLOGIST,
        isActive: true,
        isVerified: true,
        psychologist: {
          create: {
            specializations: dto.specializations ?? [],
            workingHours: {},
            approvalStatus: PsychologistApprovalStatus.APPROVED,
            approvedAt: new Date(),
            approvedById: adminId,
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        psychologist: { select: { id: true, approvalStatus: true } },
      },
    });

    await this.auditService.log({
      userId: adminId,
      action: 'CREATE',
      entity: 'User',
      entityId: user.id,
      details: { role: Role.PSYCHOLOGIST },
    });

    return user;
  }

  async findPsychologistByUserId(userId: string) {
    const p = await this.prisma.psychologist.findUnique({
      where: { userId },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    });
    if (!p) throw new NotFoundException('Psikolog profili bulunamadı');
    return p;
  }

  async findPsychologistById(id: string) {
    const p = await this.prisma.psychologist.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    });
    if (!p) throw new NotFoundException('Psikolog bulunamadı');
    return p;
  }

  async updatePsychologistProfile(userId: string, dto: UpdatePsychologistDto) {
    const p = await this.prisma.psychologist.findUnique({ where: { userId } });
    if (!p) throw new NotFoundException('Psikolog profili bulunamadı');

    const updated = await this.prisma.psychologist.update({
      where: { userId },
      data: {
        ...(dto.specializations && { specializations: dto.specializations }),
        ...(dto.biography !== undefined && { biography: dto.biography }),
        ...(dto.photoUrl !== undefined && { photoUrl: dto.photoUrl }),
        ...(dto.educationInfo !== undefined && { educationInfo: dto.educationInfo }),
        ...(dto.experienceYears !== undefined && { experienceYears: dto.experienceYears }),
        ...(dto.certificates !== undefined && { certificates: dto.certificates }),
        ...(dto.workingHours && { workingHours: dto.workingHours as Prisma.InputJsonValue }),
        ...(dto.isAcceptingClients !== undefined && { isAcceptingClients: dto.isAcceptingClients }),
      },
    });

    await this.auditService.log({
      userId,
      action: 'UPDATE',
      entity: 'PsychologistProfile',
      entityId: p.id,
      details: { updatedFields: Object.keys(dto) },
    });

    return updated;
  }

  async updatePsychologistPhoto(userId: string, photoUrl: string) {
    const p = await this.prisma.psychologist.findUnique({ where: { userId } });
    if (!p) throw new NotFoundException('Psikolog profili bulunamadı');

    const updated = await this.prisma.psychologist.update({
      where: { userId },
      data: { photoUrl },
      select: { id: true, photoUrl: true },
    });

    await this.auditService.log({
      userId,
      action: 'UPDATE',
      entity: 'PsychologistPhoto',
      entityId: p.id,
      details: { action: 'UPLOAD', newPhotoUrl: photoUrl },
    });

    return updated;
  }

  async removePsychologistPhoto(userId: string) {
    const p = await this.prisma.psychologist.findUnique({ where: { userId } });
    if (!p) throw new NotFoundException('Psikolog profili bulunamadı');

    const updated = await this.prisma.psychologist.update({
      where: { userId },
      data: { photoUrl: null },
      select: { id: true, photoUrl: true },
    });

    await this.auditService.log({
      userId,
      action: 'DELETE',
      entity: 'PsychologistPhoto',
      entityId: p.id,
      details: { action: 'REMOVE' },
    });

    return updated;
  }

  async approvePsychologist(psychologistId: string, adminId: string, approve: boolean, reason?: string) {
    const p = await this.prisma.psychologist.findUnique({ where: { id: psychologistId } });
    if (!p) throw new NotFoundException('Psikolog bulunamadı');

    const updated = await this.prisma.psychologist.update({
      where: { id: psychologistId },
      data: {
        approvalStatus: approve ? PsychologistApprovalStatus.APPROVED : PsychologistApprovalStatus.REJECTED,
        approvedAt: approve ? new Date() : null,
        approvedById: approve ? adminId : null,
        rejectionReason: !approve ? reason : null,
      },
    });

    await this.auditService.log({
      userId: adminId,
      action: approve ? 'APPROVE' : 'REJECT',
      entity: 'Psychologist',
      entityId: psychologistId,
      details: { reason },
    });

    return updated;
  }

  async findClientProfile(userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    });
    if (!client) throw new NotFoundException('Danışan profili bulunamadı');

    const { healthNotesEnc, healthNotesIv, ...rest } = client;
    const healthNotes =
      healthNotesEnc && healthNotesIv
        ? this.encryption.decrypt(healthNotesEnc, healthNotesIv)
        : null;
    return { ...rest, healthNotes };
  }

  async findAllUsers(search?: string, role?: Role) {
    const where: Prisma.UserWhereInput = {
      isActive: true,
      ...(role ? { role } : {}),
      ...(search ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    };

    return this.prisma.user.findMany({
      where,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, isActive: true, createdAt: true,
        psychologist: { select: { id: true, approvalStatus: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async exportUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, role: true, createdAt: true,
        client: {
          select: {
            dateOfBirth: true, gender: true, emergencyContact: true,
            appointments: {
              select: {
                startTime: true, endTime: true, sessionType: true,
                status: true, notes: true, createdAt: true,
              },
            },
            testResults: {
              where: { isSharedWithClient: true, completedAt: { not: null } },
              select: {
                totalScore: true, scoreCategory: true, completedAt: true,
                test: { select: { name: true, code: true } },
              },
            },
          },
        },
        psychologist: {
          select: {
            specializations: true, biography: true,
            approvalStatus: true, createdAt: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    return { exportedAt: new Date().toISOString(), data: user };
  }

  async deleteMyAccount(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        email: `deleted_${userId}@deleted.invalid`,
        firstName: 'Silinmiş',
        lastName: 'Hesap',
        phone: null,
      },
    });

    await this.auditService.log({ userId, action: 'DELETE', entity: 'User', entityId: userId });
    return { message: 'Hesabınız başarıyla silindi.' };
  }

  async deleteUser(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { psychologist: true },
    });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    if (user.role === Role.ADMIN) throw new ForbiddenException('Admin kullanıcı silinemez');

    // SessionNote deletion is now handled by Prisma Cascade

    await this.prisma.user.delete({ where: { id: userId } });

    await this.auditService.log({
      userId: adminId,
      action: 'DELETE',
      entity: 'User',
      entityId: userId,
      details: { deletedEmail: user.email, deletedRole: user.role },
    });

    return { message: 'Kullanıcı silindi' };
  }

  async getPsychologistClients(psychologistUserId: string) {
    const psych = await this.prisma.psychologist.findUnique({ where: { userId: psychologistUserId } });
    if (!psych) throw new ForbiddenException();

    const appointments = await this.prisma.appointment.findMany({
      where: { psychologistId: psych.id },
      select: {
        client: {
          select: {
            id: true,
            userId: true,
            user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          },
        },
        startTime: true,
      },
      orderBy: { startTime: 'desc' },
    });

    const clientMap = new Map<string, { id: string; userId: string; user: { firstName: string; lastName: string; email: string; phone?: string | null }; appointmentCount: number; lastAppointmentAt?: string }>();
    for (const apt of appointments) {
      const c = apt.client;
      if (!c) continue;
      if (!clientMap.has(c.id)) {
        clientMap.set(c.id, { id: c.id, userId: c.userId, user: c.user, appointmentCount: 0, lastAppointmentAt: apt.startTime.toISOString() });
      }
      clientMap.get(c.id)!.appointmentCount++;
    }

    return Array.from(clientMap.values());
  }

  async adminChangePassword(userId: string, newPassword: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    if (user.role === Role.ADMIN) throw new ForbiddenException('Admin şifresi bu yöntemle değiştirilemez');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await this.auditService.log({
      userId: adminId,
      action: 'UPDATE',
      entity: 'User',
      entityId: userId,
      details: { action: 'admin_password_change' },
    });

    return { message: 'Şifre başarıyla değiştirildi' };
  }

  async approvePsychologistByStatus(psychologistId: string, adminId: string, status: 'APPROVED' | 'REJECTED', reason?: string) {
    return this.approvePsychologist(psychologistId, adminId, status === 'APPROVED', reason);
  }

  async updateClientProfile(userId: string, dto: UpdateClientDto) {
    const client = await this.prisma.client.findUnique({ where: { userId } });
    if (!client) throw new NotFoundException('Danışan profili bulunamadı');

    let healthNotesEnc: string | undefined;
    let healthNotesIv: string | undefined;

    if (dto.healthNotes !== undefined) {
      const { encrypted, iv } = this.encryption.encrypt(dto.healthNotes);
      healthNotesEnc = encrypted;
      healthNotesIv = iv;
    }

    return this.prisma.client.update({
      where: { userId },
      data: {
        ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
        ...(dto.gender !== undefined && { gender: dto.gender }),
        ...(dto.emergencyContact !== undefined && { emergencyContact: dto.emergencyContact }),
        ...(healthNotesEnc && { healthNotesEnc, healthNotesIv }),
      },
    });
  }
}

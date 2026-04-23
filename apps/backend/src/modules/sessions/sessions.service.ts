import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EncryptionService } from '../../common/crypto/encryption.service';
import { AuditService } from '../audit/audit.service';
import { CreateSessionNoteDto } from './dto/create-session-note.dto';
import { Role, AppointmentStatus } from '@prisma/client';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
    private readonly auditService: AuditService,
  ) {}

  async createNote(dto: CreateSessionNoteDto, psychologistUserId: string) {
    const psych = await this.prisma.psychologist.findUnique({ where: { userId: psychologistUserId } });
    if (!psych) throw new ForbiddenException();

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: dto.appointmentId },
    });
    if (!appointment) throw new NotFoundException('Randevu bulunamadı');
    if (appointment.psychologistId !== psych.id) throw new ForbiddenException('Bu randevu size ait değil');
    if (appointment.status !== AppointmentStatus.COMPLETED && appointment.status !== AppointmentStatus.CONFIRMED) {
      throw new ForbiddenException('Yalnızca aktif veya tamamlanmış seanslara not eklenebilir');
    }

    const existingNote = await this.prisma.sessionNote.findUnique({
      where: { appointmentId: dto.appointmentId },
    });
    if (existingNote) throw new ConflictException('Bu randevu için zaten bir not mevcut');

    const { encrypted: contentEnc, iv: contentIv } = this.encryption.encrypt(dto.content);

    const note = await this.prisma.sessionNote.create({
      data: {
        appointmentId: dto.appointmentId,
        psychologistId: psych.id,
        contentEnc,
        contentIv,
        emotionalState: dto.emotionalState,
        goals: dto.goals,
        isSharedWithClient: dto.isSharedWithClient ?? false,
      },
    });

    await this.auditService.log({
      userId: psychologistUserId,
      action: 'CREATE',
      entity: 'SessionNote',
      entityId: note.id,
    });

    return { id: note.id, appointmentId: note.appointmentId, isSharedWithClient: note.isSharedWithClient, createdAt: note.createdAt };
  }

  async findNote(appointmentId: string, userId: string, role: Role) {
    const note = await this.prisma.sessionNote.findUnique({
      where: { appointmentId },
      include: { appointment: true },
    });
    if (!note) throw new NotFoundException('Seans notu bulunamadı');

    if (role === Role.PSYCHOLOGIST) {
      const psych = await this.prisma.psychologist.findUnique({ where: { userId } });
      if (note.psychologistId !== psych?.id) throw new ForbiddenException();
      return { ...note, content: this.encryption.decrypt(note.contentEnc, note.contentIv) };
    }

    if (role === Role.CLIENT) {
      if (!note.isSharedWithClient) throw new ForbiddenException('Bu not danışanla paylaşılmamış');
      const client = await this.prisma.client.findUnique({ where: { userId } });
      if (note.appointment.clientId !== client?.id) throw new ForbiddenException();
      return { ...note, content: this.encryption.decrypt(note.contentEnc, note.contentIv) };
    }

    if (role === Role.ADMIN) {
      return { ...note, content: this.encryption.decrypt(note.contentEnc, note.contentIv) };
    }

    throw new ForbiddenException();
  }

  async updateNote(
    noteId: string,
    data: { content?: string; isSharedWithClient?: boolean; emotionalState?: string; goals?: string },
    psychologistUserId: string,
  ) {
    const note = await this.prisma.sessionNote.findUnique({ where: { id: noteId } });
    if (!note) throw new NotFoundException();

    const psych = await this.prisma.psychologist.findUnique({ where: { userId: psychologistUserId } });
    if (note.psychologistId !== psych?.id) throw new ForbiddenException();

    let contentEnc = note.contentEnc;
    let contentIv = note.contentIv;
    if (data.content) {
      const enc = this.encryption.encrypt(data.content);
      contentEnc = enc.encrypted;
      contentIv = enc.iv;
    }

    const updated = await this.prisma.sessionNote.update({
      where: { id: noteId },
      data: {
        contentEnc,
        contentIv,
        ...(data.isSharedWithClient !== undefined && { isSharedWithClient: data.isSharedWithClient }),
        ...(data.emotionalState !== undefined && { emotionalState: data.emotionalState }),
        ...(data.goals !== undefined && { goals: data.goals }),
      },
    });

    await this.auditService.log({
      userId: psychologistUserId,
      action: 'UPDATE',
      entity: 'SessionNote',
      entityId: noteId,
    });

    return { id: updated.id, isSharedWithClient: updated.isSharedWithClient, updatedAt: updated.updatedAt };
  }

  async findClientNotes(clientUserId: string, psychologistUserId: string) {
    const psych = await this.prisma.psychologist.findUnique({ where: { userId: psychologistUserId } });
    const client = await this.prisma.client.findUnique({ where: { userId: clientUserId } });
    if (!psych || !client) throw new NotFoundException();

    const notes = await this.prisma.sessionNote.findMany({
      where: { psychologistId: psych.id, appointment: { clientId: client.id } },
      orderBy: { createdAt: 'desc' },
    });

    return notes.map((n) => ({
      id: n.id,
      appointmentId: n.appointmentId,
      content: this.encryption.decrypt(n.contentEnc, n.contentIv),
      emotionalState: n.emotionalState,
      goals: n.goals,
      isSharedWithClient: n.isSharedWithClient,
      createdAt: n.createdAt,
    }));
  }
}

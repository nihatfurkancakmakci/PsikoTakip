import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EncryptionService } from '../../common/crypto/encryption.service';
import { AuditService } from '../audit/audit.service';

const mockPrisma = {
  psychologist: { findUnique: jest.fn() },
  client: { findUnique: jest.fn() },
  appointment: { findUnique: jest.fn() },
  sessionNote: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
};

const mockEncryption = {
  encrypt: jest.fn().mockReturnValue({ encrypted: 'enc', iv: 'iv' }),
  decrypt: jest.fn().mockReturnValue('decrypted content'),
};

const mockAudit = { log: jest.fn().mockResolvedValue(undefined) };

describe('SessionsService', () => {
  let service: SessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EncryptionService, useValue: mockEncryption },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();
    service = module.get<SessionsService>(SessionsService);
    jest.clearAllMocks();
  });

  describe('createNote', () => {
    it('tamamlanmış randevuya not oluşturur', async () => {
      mockPrisma.psychologist.findUnique.mockResolvedValue({ id: 'psych-1' });
      mockPrisma.appointment.findUnique.mockResolvedValue({
        id: 'apt-1', psychologistId: 'psych-1', status: 'COMPLETED',
      });
      mockPrisma.sessionNote.findUnique.mockResolvedValue(null);
      mockPrisma.sessionNote.create.mockResolvedValue({ id: 'note-1', appointmentId: 'apt-1', isSharedWithClient: false, createdAt: new Date() });

      const result = await service.createNote(
        { appointmentId: 'apt-1', content: 'Test notu' },
        'user-1',
      );
      expect(result.id).toBe('note-1');
    });

    it('tamamlanmamış randevuda ForbiddenException fırlatır', async () => {
      mockPrisma.psychologist.findUnique.mockResolvedValue({ id: 'psych-1' });
      mockPrisma.appointment.findUnique.mockResolvedValue({
        id: 'apt-1', psychologistId: 'psych-1', status: 'CONFIRMED',
      });

      await expect(service.createNote({ appointmentId: 'apt-1', content: 'Not' }, 'user-1'))
        .rejects.toThrow(ForbiddenException);
    });

    it('başka psikoloğun randevusunda ForbiddenException fırlatır', async () => {
      mockPrisma.psychologist.findUnique.mockResolvedValue({ id: 'psych-1' });
      mockPrisma.appointment.findUnique.mockResolvedValue({
        id: 'apt-1', psychologistId: 'psych-OTHER', status: 'COMPLETED',
      });

      await expect(service.createNote({ appointmentId: 'apt-1', content: 'Not' }, 'user-1'))
        .rejects.toThrow(ForbiddenException);
    });

    it('aynı randevuya ikinci not eklemede ConflictException fırlatır', async () => {
      mockPrisma.psychologist.findUnique.mockResolvedValue({ id: 'psych-1' });
      mockPrisma.appointment.findUnique.mockResolvedValue({
        id: 'apt-1', psychologistId: 'psych-1', status: 'COMPLETED',
      });
      mockPrisma.sessionNote.findUnique.mockResolvedValue({ id: 'existing-note' });

      await expect(service.createNote({ appointmentId: 'apt-1', content: 'Not' }, 'user-1'))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('findNote', () => {
    it('psikolog kendi notunu görebilir', async () => {
      mockPrisma.sessionNote.findUnique.mockResolvedValue({
        id: 'note-1', psychologistId: 'psych-1', contentEnc: 'enc', contentIv: 'iv',
        appointment: { clientId: 'client-1' },
      });
      mockPrisma.psychologist.findUnique.mockResolvedValue({ id: 'psych-1' });

      const result = await service.findNote('apt-1', 'user-1', 'PSYCHOLOGIST' as any);
      expect(result.content).toBe('decrypted content');
    });

    it('paylaşılmamış nota danışan erişemez', async () => {
      mockPrisma.sessionNote.findUnique.mockResolvedValue({
        id: 'note-1', psychologistId: 'psych-1', isSharedWithClient: false,
        contentEnc: 'enc', contentIv: 'iv',
        appointment: { clientId: 'client-1' },
      });

      await expect(service.findNote('apt-1', 'user-client', 'CLIENT' as any))
        .rejects.toThrow(ForbiddenException);
    });

    it('olmayan nota NotFoundException fırlatır', async () => {
      mockPrisma.sessionNote.findUnique.mockResolvedValue(null);
      await expect(service.findNote('apt-1', 'user-1', 'PSYCHOLOGIST' as any))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updateNote', () => {
    it('psikolog kendi notunu güncelleyebilir', async () => {
      mockPrisma.sessionNote.findUnique.mockResolvedValue({
        id: 'note-1', psychologistId: 'psych-1', contentEnc: 'enc', contentIv: 'iv',
      });
      mockPrisma.psychologist.findUnique.mockResolvedValue({ id: 'psych-1' });
      mockPrisma.sessionNote.update.mockResolvedValue({
        id: 'note-1', isSharedWithClient: true, updatedAt: new Date(),
      });

      const result = await service.updateNote('note-1', { isSharedWithClient: true }, 'user-1');
      expect(result.isSharedWithClient).toBe(true);
    });
  });
});

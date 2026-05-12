import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EncryptionService } from '../../common/crypto/encryption.service';
import { AuditService } from '../audit/audit.service';

const mockPrisma = {
  user: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  psychologist: { findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn() },
  client: { findUnique: jest.fn(), update: jest.fn() },
  appointment: { findMany: jest.fn() },
  sessionNote: { deleteMany: jest.fn() },
  auditLog: { create: jest.fn() },
};

const mockEncryption = {
  encrypt: jest.fn().mockReturnValue({ encrypted: 'enc', iv: 'iv' }),
  decrypt: jest.fn().mockReturnValue('decrypted'),
};

const mockAudit = { log: jest.fn().mockResolvedValue(undefined) };

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EncryptionService, useValue: mockEncryption },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findAllPsychologists', () => {
    it('tüm psikologları döner', async () => {
      mockPrisma.psychologist.findMany.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);
      const result = await service.findAllPsychologists();
      expect(result).toHaveLength(2);
    });
  });

  describe('findPsychologistById', () => {
    it('mevcut psikoloğu döner', async () => {
      mockPrisma.psychologist.findUnique.mockResolvedValue({ id: 'p1', user: {} });
      const result = await service.findPsychologistById('p1');
      expect(result.id).toBe('p1');
    });

    it('bulunamazsa NotFoundException fırlatır', async () => {
      mockPrisma.psychologist.findUnique.mockResolvedValue(null);
      await expect(service.findPsychologistById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('approvePsychologist', () => {
    it('psikoloğu onaylar', async () => {
      mockPrisma.psychologist.findUnique.mockResolvedValue({ id: 'p1' });
      mockPrisma.psychologist.update.mockResolvedValue({ id: 'p1', approvalStatus: 'APPROVED' });

      const result = await service.approvePsychologist('p1', 'admin-1', true);
      expect(result.approvalStatus).toBe('APPROVED');
      expect(mockAudit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'APPROVE' }));
    });

    it('psikoloğu reddeder', async () => {
      mockPrisma.psychologist.findUnique.mockResolvedValue({ id: 'p1' });
      mockPrisma.psychologist.update.mockResolvedValue({ id: 'p1', approvalStatus: 'REJECTED' });

      const result = await service.approvePsychologist('p1', 'admin-1', false, 'Belgeler eksik');
      expect(result.approvalStatus).toBe('REJECTED');
      expect(mockAudit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'REJECT' }));
    });

    it('bulunamazsa NotFoundException fırlatır', async () => {
      mockPrisma.psychologist.findUnique.mockResolvedValue(null);
      await expect(service.approvePsychologist('nonexistent', 'admin-1', true))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('findClientProfile', () => {
    it('sağlık notlarını şifresi çözülmüş olarak döner', async () => {
      mockPrisma.client.findUnique.mockResolvedValue({
        id: 'c1', userId: 'u1',
        healthNotesEnc: 'enc', healthNotesIv: 'iv',
        user: { id: 'u1', email: 'a@b.com', firstName: 'A', lastName: 'B' },
      });

      const result = await service.findClientProfile('u1');
      expect(result.healthNotes).toBe('decrypted');
      expect(result).not.toHaveProperty('healthNotesEnc');
    });

    it('bulunamazsa NotFoundException fırlatır', async () => {
      mockPrisma.client.findUnique.mockResolvedValue(null);
      await expect(service.findClientProfile('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUser', () => {
    it('kullanıcıyı siler', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'CLIENT', isActive: true, psychologist: null });
      mockPrisma.user.delete.mockResolvedValue({ id: 'u1' });

      const result = await service.deleteUser('u1', 'admin-1');
      expect(result).toEqual({ message: 'Kullanıcı silindi' });
    });

    it('admin kullanıcıyı silmeye ForbiddenException fırlatır', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'ADMIN', psychologist: null });
      await expect(service.deleteUser('u1', 'admin-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAllUsers', () => {
    it('kullanıcıları listeler', async () => {
      mockPrisma.user.findMany.mockResolvedValue([{ id: 'u1' }, { id: 'u2' }]);
      const result = await service.findAllUsers();
      expect(result).toHaveLength(2);
    });

    it('rol filtresiyle kullanıcıları listeler', async () => {
      mockPrisma.user.findMany.mockResolvedValue([{ id: 'u1', role: 'CLIENT' }]);
      const result = await service.findAllUsers(undefined, 'CLIENT' as any);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ role: 'CLIENT' }),
      }));
      expect(result).toHaveLength(1);
    });
  });

  describe('exportUserData', () => {
    it('kullanıcının verilerini döner', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1', email: 'a@b.com', firstName: 'A', lastName: 'B',
        role: 'CLIENT', createdAt: new Date(), client: null, psychologist: null,
      });
      const result = await service.exportUserData('u1');
      expect(result.data.id).toBe('u1');
      expect(result.exportedAt).toBeDefined();
    });

    it('bulunamazsa NotFoundException fırlatır', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.exportUserData('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteMyAccount', () => {
    it('hesabı anonim hale getirir', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', role: 'CLIENT' });
      mockPrisma.user.update.mockResolvedValue({ id: 'u1', isActive: false });

      const result = await service.deleteMyAccount('u1');
      expect(result.message).toContain('silindi');
      expect(mockPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ isActive: false }),
      }));
    });
  });

  describe('approvePsychologistByStatus', () => {
    it('APPROVED ile psikoloğu onaylar', async () => {
      mockPrisma.psychologist.findUnique.mockResolvedValue({ id: 'p1' });
      mockPrisma.psychologist.update.mockResolvedValue({ id: 'p1', approvalStatus: 'APPROVED' });

      const result = await service.approvePsychologistByStatus('p1', 'admin-1', 'APPROVED');
      expect(result.approvalStatus).toBe('APPROVED');
    });
  });

  describe('updatePsychologistProfile', () => {
    it('profili günceller', async () => {
      mockPrisma.psychologist.findUnique.mockResolvedValue({ id: 'p1', userId: 'u1' });
      mockPrisma.psychologist.update.mockResolvedValue({ id: 'p1', specialization: 'BDT' });

      const result = await service.updatePsychologistProfile('u1', { specialization: 'BDT' });
      expect(result.specialization).toBe('BDT');
    });

    it('bulunamazsa NotFoundException fırlatır', async () => {
      mockPrisma.psychologist.findUnique.mockResolvedValue(null);
      await expect(service.updatePsychologistProfile('u1', {})).rejects.toThrow(NotFoundException);
    });
  });
});

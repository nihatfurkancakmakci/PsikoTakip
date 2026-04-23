import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';

const mockPrisma = {
  auditLog: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<AuditService>(AuditService);
    jest.clearAllMocks();
  });

  describe('log', () => {
    it('audit kaydı oluşturur', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-1' });

      await service.log({
        userId: 'user-1',
        action: 'LOGIN',
        entity: 'User',
        entityId: 'user-1',
        ipAddress: '127.0.0.1',
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ action: 'LOGIN', entity: 'User' }),
      }));
    });

    it('userId olmadan da kayıt oluşturur', async () => {
      mockPrisma.auditLog.create.mockResolvedValue({ id: 'log-2' });
      await service.log({ action: 'LOGIN_FAILED', entity: 'Auth' });
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('sayfalanmış kayıtları döner', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([{ id: 'l1' }, { id: 'l2' }]);
      mockPrisma.auditLog.count.mockResolvedValue(2);

      const result = await service.findAll(1, 10);
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.totalPages).toBe(1);
    });

    it('userId filtresiyle kayıtları döner', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([{ id: 'l1' }]);
      mockPrisma.auditLog.count.mockResolvedValue(1);

      await service.findAll(1, 10, 'user-1');
      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: 'user-1' },
      }));
    });

    it('action filtresiyle kayıtları döner', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.count.mockResolvedValue(0);

      await service.findAll(1, 10, undefined, 'LOGIN');
      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { action: 'LOGIN' },
      }));
    });

    it('doğru skip değerini hesaplar', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.count.mockResolvedValue(50);

      const result = await service.findAll(3, 10);
      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 20 }));
      expect(result.page).toBe(3);
    });
  });
});

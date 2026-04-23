import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { TestsService } from './tests.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EncryptionService } from '../../common/crypto/encryption.service';
import { ScoringFactory } from './scoring/scoring.factory';
import { AuditService } from '../audit/audit.service';

const mockPrisma = {
  psychologicalTest: { findMany: jest.fn(), findUnique: jest.fn() },
  testResult: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  client: { findUnique: jest.fn() },
  psychologist: { findUnique: jest.fn() },
};

const mockEncryption = {
  encrypt: jest.fn().mockReturnValue({ encrypted: 'enc', iv: 'iv' }),
  decrypt: jest.fn().mockReturnValue('[]'),
};

const mockAudit = { log: jest.fn().mockResolvedValue(undefined) };

describe('TestsService', () => {
  let service: TestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestsService,
        ScoringFactory,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EncryptionService, useValue: mockEncryption },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();
    service = module.get<TestsService>(TestsService);
    jest.clearAllMocks();
  });

  describe('submitTest', () => {
    it('test <2 saniyede tamamlanır (performans)', async () => {
      const bdeAnswers = Array(21).fill(1);
      const bdeThresholds = [
        { min: 0, max: 13, category: 'NORMAL' },
        { min: 14, max: 19, category: 'HAFIF' },
        { min: 20, max: 28, category: 'ORTA' },
        { min: 29, max: 63, category: 'AGIR' },
      ];

      mockPrisma.client.findUnique.mockResolvedValue({ id: 'c-1' });
      mockPrisma.testResult.findUnique.mockResolvedValue({
        id: 'tr-1',
        clientId: 'c-1',
        completedAt: null,
        testId: 't-1',
        test: { scoringAlgorithm: { type: 'sum' }, categoryThresholds: bdeThresholds },
      });
      mockPrisma.testResult.update.mockResolvedValue({
        id: 'tr-1',
        totalScore: 21,
        scoreCategory: 'ORTA',
        completedAt: new Date(),
      });

      const start = Date.now();
      const result = await service.submitTest({ testResultId: 'tr-1', answers: bdeAnswers }, 'user-1');
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(2000);
      expect(result.scoreCategory).toBe('ORTA');
      expect(result.totalScore).toBe(21);
    });

    it('zaten tamamlanmış teste BadRequestException fırlatır', async () => {
      mockPrisma.client.findUnique.mockResolvedValue({ id: 'c-1' });
      mockPrisma.testResult.findUnique.mockResolvedValue({
        id: 'tr-1', clientId: 'c-1', completedAt: new Date(),
        test: { scoringAlgorithm: {}, categoryThresholds: [] },
      });
      await expect(service.submitTest({ testResultId: 'tr-1', answers: [1] }, 'user-1'))
        .rejects.toThrow(BadRequestException);
    });

    it('başkasının testine ForbiddenException fırlatır', async () => {
      mockPrisma.client.findUnique.mockResolvedValue({ id: 'c-mine' });
      mockPrisma.testResult.findUnique.mockResolvedValue({
        id: 'tr-1', clientId: 'c-other', completedAt: null,
        test: { scoringAlgorithm: {}, categoryThresholds: [] },
      });
      await expect(service.submitTest({ testResultId: 'tr-1', answers: [1] }, 'user-1'))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAllTests', () => {
    it('aktif testleri döner', async () => {
      mockPrisma.psychologicalTest.findMany.mockResolvedValue([
        { id: 't-1', name: 'BDE-II', code: 'BDE-II', description: '' },
      ]);
      const result = await service.findAllTests();
      expect(result).toHaveLength(1);
    });
  });

  describe('findTestById', () => {
    it('testi döner', async () => {
      mockPrisma.psychologicalTest.findUnique.mockResolvedValue({ id: 't-1', name: 'BDE-II' });
      const result = await service.findTestById('t-1');
      expect(result.id).toBe('t-1');
    });

    it('bulunamazsa NotFoundException fırlatır', async () => {
      mockPrisma.psychologicalTest.findUnique.mockResolvedValue(null);
      await expect(service.findTestById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('assignTest', () => {
    it('danışana test atar', async () => {
      mockPrisma.psychologist.findUnique.mockResolvedValue({ id: 'psych-1' });
      mockPrisma.psychologicalTest.findUnique.mockResolvedValue({ id: 't-1', name: 'BDE-II' });
      mockPrisma.client.findUnique.mockResolvedValue({ id: 'c-1' });
      mockPrisma.testResult.create.mockResolvedValue({ id: 'tr-new' });

      const result = await service.assignTest({ testId: 't-1', clientUserId: 'client-user-1' }, 'psych-user-1');
      expect(result.testResultId).toBe('tr-new');
    });

    it('psikolog değilse ForbiddenException fırlatır', async () => {
      mockPrisma.psychologist.findUnique.mockResolvedValue(null);
      await expect(service.assignTest({ testId: 't-1', clientUserId: 'c-1' }, 'user-1'))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('getAssignedTests', () => {
    it('tamamlanmamış testleri döner', async () => {
      mockPrisma.client.findUnique.mockResolvedValue({ id: 'c-1' });
      mockPrisma.testResult.findMany.mockResolvedValue([
        { id: 'tr-1', test: { name: 'BDE-II', code: 'BDE-II', description: '' } },
      ]);
      const result = await service.getAssignedTests('user-1');
      expect(result).toHaveLength(1);
      expect(result[0].resultId).toBe('tr-1');
    });
  });

  describe('getMyTestResults', () => {
    it('danışanın paylaşılan tamamlanmış sonuçlarını döner', async () => {
      mockPrisma.client.findUnique.mockResolvedValue({ id: 'c-1' });
      mockPrisma.testResult.findMany.mockResolvedValue([
        { id: 'tr-1', totalScore: 21, test: { name: 'BDE-II', code: 'BDE-II' } },
      ]);
      const result = await service.getMyTestResults('user-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('getTestResultForClient', () => {
    it('psikolog herhangi bir sonucu görebilir', async () => {
      mockPrisma.testResult.findUnique.mockResolvedValue({
        id: 'tr-1', clientId: 'c-1', completedAt: null,
        test: { name: 'BDE-II', code: 'BDE-II', description: null, questions: [{ id: 1, text: 'Soru 1', options: [] }] },
      });
      const result = await service.getTestResultForClient('tr-1', 'psych-user', 'PSYCHOLOGIST' as any);
      expect(result.id).toBe('tr-1');
      expect(result.questions).toHaveLength(1);
    });

    it('danışan başkasının testine erişemez', async () => {
      mockPrisma.testResult.findUnique.mockResolvedValue({
        id: 'tr-1', clientId: 'c-other',
        test: { questions: [] },
      });
      mockPrisma.client.findUnique.mockResolvedValue({ id: 'c-mine' });
      await expect(service.getTestResultForClient('tr-1', 'user-1', 'CLIENT' as any))
        .rejects.toThrow(ForbiddenException);
    });
  });
});

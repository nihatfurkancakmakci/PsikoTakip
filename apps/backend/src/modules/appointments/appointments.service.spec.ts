import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AppointmentStatus, SessionType, PsychologistApprovalStatus } from '@prisma/client';

const mockPrisma = {
  client: { findUnique: jest.fn() },
  psychologist: { findUnique: jest.fn() },
  appointment: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockAudit = { log: jest.fn().mockResolvedValue(undefined) };
const mockNotifications = { sendAppointmentNotification: jest.fn().mockResolvedValue(undefined) };

describe('AppointmentsService', () => {
  let service: AppointmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
        { provide: NotificationsService, useValue: mockNotifications },
      ],
    }).compile();
    service = module.get<AppointmentsService>(AppointmentsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('çakışma varsa ConflictException fırlatır', async () => {
      mockPrisma.client.findUnique.mockResolvedValue({ id: 'client-1' });
      mockPrisma.psychologist.findUnique.mockResolvedValue({
        id: 'psych-1',
        approvalStatus: PsychologistApprovalStatus.APPROVED,
        isAcceptingClients: true,
      });
      mockPrisma.appointment.findFirst.mockResolvedValue({ id: 'conflict-id' });

      const future = new Date(Date.now() + 86400000);
      await expect(service.create('user-1', {
        psychologistId: 'psych-1',
        startTime: future.toISOString(),
        endTime: new Date(future.getTime() + 3600000).toISOString(),
        sessionType: SessionType.IN_PERSON,
      })).rejects.toThrow(ConflictException);
    });

    it('onaylanmamış psikolog için BadRequestException fırlatır', async () => {
      mockPrisma.client.findUnique.mockResolvedValue({ id: 'client-1' });
      mockPrisma.psychologist.findUnique.mockResolvedValue({
        id: 'psych-1',
        approvalStatus: PsychologistApprovalStatus.PENDING_APPROVAL,
        isAcceptingClients: true,
      });

      const future = new Date(Date.now() + 86400000);
      await expect(service.create('user-1', {
        psychologistId: 'psych-1',
        startTime: future.toISOString(),
        endTime: new Date(future.getTime() + 3600000).toISOString(),
        sessionType: SessionType.IN_PERSON,
      })).rejects.toThrow(BadRequestException);
    });

    it('geçmiş tarihe randevu oluşturamaz', async () => {
      mockPrisma.client.findUnique.mockResolvedValue({ id: 'client-1' });
      mockPrisma.psychologist.findUnique.mockResolvedValue({
        id: 'psych-1',
        approvalStatus: PsychologistApprovalStatus.APPROVED,
        isAcceptingClients: true,
      });
      mockPrisma.appointment.findFirst.mockResolvedValue(null);

      await expect(service.create('user-1', {
        psychologistId: 'psych-1',
        startTime: '2020-01-01T10:00:00Z',
        endTime: '2020-01-01T11:00:00Z',
        sessionType: SessionType.IN_PERSON,
      })).rejects.toThrow(BadRequestException);
    });

    it('online seans için video link üretir', async () => {
      mockPrisma.client.findUnique.mockResolvedValue({ id: 'client-1' });
      mockPrisma.psychologist.findUnique.mockResolvedValue({
        id: 'psych-1',
        approvalStatus: PsychologistApprovalStatus.APPROVED,
        isAcceptingClients: true,
      });
      mockPrisma.appointment.findFirst.mockResolvedValue(null);
      mockPrisma.appointment.create.mockResolvedValue({
        id: 'appt-1',
        videoMeetingUrl: 'https://meet.psikotakip.com/uuid-here',
        client: { user: { email: 'c@t.com', firstName: 'A', lastName: 'B' } },
        psychologist: { user: { email: 'p@t.com', firstName: 'C', lastName: 'D' } },
        startTime: new Date(),
      });

      const future = new Date(Date.now() + 86400000);
      const result = await service.create('user-1', {
        psychologistId: 'psych-1',
        startTime: future.toISOString(),
        endTime: new Date(future.getTime() + 3600000).toISOString(),
        sessionType: SessionType.ONLINE,
      });
      expect(result.videoMeetingUrl).toBeTruthy();
    });
  });

  describe('getAvailableSlots', () => {
    it('psikolog bulunamazsa NotFoundException fırlatır', async () => {
      mockPrisma.psychologist.findUnique.mockResolvedValue(null);
      await expect(service.getAvailableSlots('nonexistent', '2026-04-25'))
        .rejects.toThrow(NotFoundException);
    });
  });
});

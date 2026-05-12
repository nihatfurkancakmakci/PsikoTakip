import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcrypt';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  client: { create: jest.fn() },
  psychologist: { create: jest.fn() },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
};

const mockJwt = { sign: jest.fn().mockReturnValue('mocked.jwt.token') };
const mockConfig = { get: jest.fn().mockReturnValue('secret'), getOrThrow: jest.fn().mockReturnValue('secret') };
const mockAudit = { log: jest.fn().mockResolvedValue(undefined) };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('yeni kullanıcıyı kaydeder', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'uuid-1', email: 'test@test.com', role: 'CLIENT',
      });
      mockPrisma.client.create.mockResolvedValue({});

      const result = await service.register({
        email: 'test@test.com', password: 'Sifre1234!',
        firstName: 'Test', lastName: 'User', phone: '+905551234567',
      });
      expect(result.message).toContain('başarılı');
    });

    it('mevcut e-posta ile ConflictException fırlatır', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(service.register({
        email: 'existing@test.com', password: 'Sifre1234!',
        firstName: 'A', lastName: 'B', phone: '+905551234567',
      })).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('geçerli kimlik bilgileriyle token döner', async () => {
      const hash = await bcrypt.hash('Sifre1234!', 12);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'uuid-1', email: 'u@t.com', passwordHash: hash,
        isActive: true, role: 'CLIENT', firstName: 'A', lastName: 'B',
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login({ email: 'u@t.com', password: 'Sifre1234!' });
      expect(result.accessToken).toBe('mocked.jwt.token');
      expect(result.user.email).toBe('u@t.com');
    });

    it('hatalı şifrede UnauthorizedException fırlatır', async () => {
      const hash = await bcrypt.hash('doğruşifre', 12);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'uuid-1', email: 'u@t.com', passwordHash: hash, isActive: true,
      });
      await expect(service.login({ email: 'u@t.com', password: 'yanlışşifre' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('pasif kullanıcıya UnauthorizedException fırlatır', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'uuid-1', isActive: false });
      await expect(service.login({ email: 'u@t.com', password: 'sifre' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EncryptionService } from '../../common/crypto/encryption.service';
import { ScoringFactory } from './scoring/scoring.factory';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AssignTestDto } from './dto/assign-test.dto';
import { SubmitTestDto } from './dto/submit-test.dto';
import { Role } from '@prisma/client';

@Injectable()
export class TestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
    private readonly scoringFactory: ScoringFactory,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAllTests() {
    return this.prisma.psychologicalTest.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true, description: true, createdAt: true },
    });
  }

  async findTestById(id: string) {
    const test = await this.prisma.psychologicalTest.findUnique({ where: { id } });
    if (!test) throw new NotFoundException('Test bulunamadı');
    return test;
  }

  async assignTest(dto: AssignTestDto, psychologistUserId: string) {
    const psych = await this.prisma.psychologist.findUnique({ where: { userId: psychologistUserId } });
    if (!psych) throw new ForbiddenException();

    const test = await this.prisma.psychologicalTest.findUnique({ where: { id: dto.testId } });
    if (!test) throw new NotFoundException('Test bulunamadı');

    const client = await this.prisma.client.findUnique({ where: { userId: dto.clientUserId } });
    if (!client) throw new NotFoundException('Danışan bulunamadı');

    const { encrypted: answersEnc, iv: answersIv } = this.encryption.encrypt('[]');
    const result = await this.prisma.testResult.create({
      data: {
        clientId: client.id,
        testId: dto.testId,
        assignedById: psychologistUserId,
        answersEnc,
        answersIv,
        totalScore: 0,
        scoreCategory: 'ATANMADI',
      },
    });

    await this.notificationsService.sendGeneralNotification(
      dto.clientUserId,
      'TEST_ASSIGNED',
      'Yeni Test Atandı',
      `"${test.name}" testi size atandı. Lütfen tamamlayın.`,
    );

    return { testResultId: result.id, testName: test.name, clientId: client.id };
  }

  async submitTest(dto: SubmitTestDto, clientUserId: string) {
    const client = await this.prisma.client.findUnique({ where: { userId: clientUserId } });
    if (!client) throw new ForbiddenException();

    const testResult = await this.prisma.testResult.findUnique({
      where: { id: dto.testResultId },
      include: { test: true },
    });
    if (!testResult) throw new NotFoundException('Test sonucu bulunamadı');
    if (testResult.clientId !== client.id) throw new ForbiddenException();
    if (testResult.completedAt) throw new BadRequestException('Test zaten tamamlanmış');

    const strategy = this.scoringFactory.getStrategy('sum');
    const scored = strategy.calculate(
      dto.answers,
      testResult.test.scoringAlgorithm,
      testResult.test.categoryThresholds,
    );

    const { encrypted: answersEnc, iv: answersIv } = this.encryption.encrypt(
      JSON.stringify(dto.answers),
    );

    const updated = await this.prisma.testResult.update({
      where: { id: dto.testResultId },
      data: {
        answersEnc,
        answersIv,
        totalScore: scored.totalScore,
        scoreCategory: scored.scoreCategory,
        completedAt: new Date(),
      },
    });

    await this.auditService.log({
      userId: clientUserId,
      action: 'CREATE',
      entity: 'TestResult',
      entityId: updated.id,
      details: { testId: testResult.testId, score: scored.totalScore, category: scored.scoreCategory },
    });

    if (testResult.assignedById) {
      await this.notificationsService.sendGeneralNotification(
        testResult.assignedById,
        'TEST_COMPLETED',
        'Test Tamamlandı',
        `Danışanınız "${testResult.test.name}" testini tamamladı. Puan: ${scored.totalScore} (${scored.scoreCategory})`,
      );
    }

    return {
      testResultId: updated.id,
      totalScore: scored.totalScore,
      scoreCategory: scored.scoreCategory,
      completedAt: updated.completedAt,
    };
  }

  async getClientProgress(clientUserId: string, requesterId: string, role: Role) {
    let clientId: string;

    if (role === Role.CLIENT) {
      const client = await this.prisma.client.findUnique({ where: { userId: clientUserId } });
      if (!client) throw new ForbiddenException();
      if (clientUserId !== requesterId) throw new ForbiddenException();
      clientId = client.id;
    } else if (role === Role.PSYCHOLOGIST || role === Role.ADMIN) {
      const client = await this.prisma.client.findUnique({ where: { userId: clientUserId } });
      if (!client) throw new NotFoundException('Danışan bulunamadı');
      clientId = client.id;
    } else {
      throw new ForbiddenException();
    }

    const results = await this.prisma.testResult.findMany({
      where: { clientId, completedAt: { not: null } },
      include: { test: { select: { name: true, code: true } } },
      orderBy: { completedAt: 'asc' },
    });

    return results.map((r) => ({
      id: r.id,
      testName: r.test.name,
      testCode: r.test.code,
      totalScore: r.totalScore,
      scoreCategory: r.scoreCategory,
      completedAt: r.completedAt,
      isSharedWithClient: r.isSharedWithClient,
    }));
  }

  async getMyTestResults(clientUserId: string) {
    const client = await this.prisma.client.findUnique({ where: { userId: clientUserId } });
    if (!client) throw new ForbiddenException();

    return this.prisma.testResult.findMany({
      where: { clientId: client.id, isSharedWithClient: true, completedAt: { not: null } },
      include: { test: { select: { name: true, code: true } } },
      orderBy: { completedAt: 'desc' },
    });
  }

  async getAssignedTests(clientUserId: string) {
    const client = await this.prisma.client.findUnique({ where: { userId: clientUserId } });
    if (!client) throw new ForbiddenException();

    const results = await this.prisma.testResult.findMany({
      where: { clientId: client.id, completedAt: null },
      include: { test: { select: { name: true, code: true, description: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return results.map(r => ({
      resultId: r.id,
      test: r.test,
    }));
  }

  async toggleShareWithClient(resultId: string, psychologistUserId: string, isSharedWithClient: boolean) {
    const psych = await this.prisma.psychologist.findUnique({ where: { userId: psychologistUserId } });
    if (!psych) throw new ForbiddenException();

    const result = await this.prisma.testResult.findUnique({ where: { id: resultId } });
    if (!result) throw new NotFoundException('Test sonucu bulunamadı');

    const client = await this.prisma.client.findUnique({ where: { id: result.clientId } });
    const appointment = await this.prisma.appointment.findFirst({
      where: { clientId: result.clientId, psychologistId: psych.id },
    });
    if (!appointment) throw new ForbiddenException('Bu danışanın test sonuçlarını düzenleyemezsiniz');

    const updated = await this.prisma.testResult.update({
      where: { id: resultId },
      data: { isSharedWithClient },
      include: { test: { select: { name: true } } },
    });

    if (isSharedWithClient && client) {
      await this.notificationsService.sendGeneralNotification(
        client.userId,
        'TEST_RESULT_SHARED',
        'Test Sonucunuz Paylaşıldı',
        `"${updated.test.name}" test sonucunuz psikologunuz tarafından sizinle paylaşıldı.`,
      );
    }

    return { id: updated.id, isSharedWithClient: updated.isSharedWithClient };
  }

  async getClientTestResults(clientUserId: string, psychologistUserId: string, role: Role) {
    if (role === Role.PSYCHOLOGIST) {
      const psych = await this.prisma.psychologist.findUnique({ where: { userId: psychologistUserId } });
      if (!psych) throw new ForbiddenException();
    }

    const client = await this.prisma.client.findUnique({ where: { userId: clientUserId } });
    if (!client) throw new NotFoundException('Danışan bulunamadı');

    return this.prisma.testResult.findMany({
      where: { clientId: client.id, completedAt: { not: null } },
      include: { test: { select: { name: true, code: true } } },
      orderBy: { completedAt: 'desc' },
    });
  }

  async getTestResultForClient(resultId: string, userId: string, role: Role) {
    const result = await this.prisma.testResult.findUnique({
      where: { id: resultId },
      include: { test: true },
    });
    if (!result) throw new NotFoundException('Test sonucu bulunamadı');

    if (role === Role.CLIENT) {
      const client = await this.prisma.client.findUnique({ where: { userId } });
      if (!client || result.clientId !== client.id) throw new ForbiddenException();
    }

    const questions = (result.test.questions as any[]).map((q, idx) => ({
      id: String(q.id),
      text: q.text,
      orderIndex: q.orderIndex ?? idx,
      options: q.options,
    }));

    return {
      id: result.id,
      test: { name: result.test.name, code: result.test.code, description: result.test.description },
      questions,
      completedAt: result.completedAt,
    };
  }
}

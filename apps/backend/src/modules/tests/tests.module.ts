import { Module } from '@nestjs/common';
import { TestsService } from './tests.service';
import { TestsController } from './tests.controller';
import { ScoringFactory } from './scoring/scoring.factory';
import { EncryptionService } from '../../common/crypto/encryption.service';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuditModule, NotificationsModule],
  controllers: [TestsController],
  providers: [TestsService, ScoringFactory, EncryptionService],
  exports: [TestsService],
})
export class TestsModule {}

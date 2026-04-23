import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { EncryptionService } from '../../common/crypto/encryption.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [SessionsController],
  providers: [SessionsService, EncryptionService],
  exports: [SessionsService],
})
export class SessionsModule {}

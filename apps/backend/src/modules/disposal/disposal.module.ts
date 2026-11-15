import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';
import { DisposalController } from './disposal.controller';
import { DisposalService } from './disposal.service';

@Module({
  imports: [NotificationsModule, AuditModule],
  controllers: [DisposalController],
  providers: [DisposalService],
  exports: [DisposalService],
})
export class DisposalModule {}

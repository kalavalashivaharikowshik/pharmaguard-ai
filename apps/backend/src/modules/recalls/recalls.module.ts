import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { RecallsController } from './recalls.controller';
import { RecallsService } from './recalls.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    AuditModule,
  ],

  controllers: [
    RecallsController,
  ],

  providers: [
    RecallsService,
  ],

  exports: [
    RecallsService,
  ],
})
export class RecallsModule {}
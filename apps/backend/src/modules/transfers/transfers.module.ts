import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';

import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    AuditModule,
  ],

  controllers: [
    TransfersController,
  ],

  providers: [
    TransfersService,
  ],

  exports: [
    TransfersService,
  ],
})
export class TransfersModule {}
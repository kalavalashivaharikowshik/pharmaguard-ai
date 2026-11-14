import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';

import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';

import { NotificationsModule } from '../notifications/notifications.module';


@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
  ],

  controllers: [
    ComplianceController,
  ],

  providers: [
    ComplianceService,
  ],
})
export class ComplianceModule {}
import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';

import { RevocationController } from './revocation.controller';
import { RevocationService } from './revocation.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';
import { DisposalModule } from '../disposal/disposal.module';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    AuditModule,
    DisposalModule,
  ],

  controllers: [
    RevocationController,
  ],

  providers: [
    RevocationService,
  ],

  exports: [
    RevocationService,
  ],
})
export class RevocationModule {}
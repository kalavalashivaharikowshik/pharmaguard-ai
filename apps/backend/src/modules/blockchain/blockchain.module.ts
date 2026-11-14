import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { RevocationModule } from '../revocation/revocation.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';

import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';

@Module({
  imports: [
    PrismaModule,
    RevocationModule,
    NotificationsModule,
    AuditModule,
  ],

  controllers: [
    BlockchainController,
  ],

  providers: [
    BlockchainService,
  ],

  exports: [
    BlockchainService,
  ],
})
export class BlockchainModule {}
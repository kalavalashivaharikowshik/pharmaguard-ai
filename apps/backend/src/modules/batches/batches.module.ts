import { Module } from '@nestjs/common';

import { BatchesController } from './batches.controller';
import { BatchesService } from './batches.service';
import { QrService } from './qr/qr.service';

import { BlockchainModule } from '../blockchain/blockchain.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    BlockchainModule,
    NotificationsModule,
    AuditModule,
  ],

  controllers: [
    BatchesController,
  ],

  providers: [
    BatchesService,
    QrService,
  ],

  exports: [
    BatchesService,
  ],
})
export class BatchesModule {}
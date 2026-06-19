import { Module } from '@nestjs/common';

import { BatchesController } from './batches.controller';
import { BatchesService } from './batches.service';
import { QrService } from './qr/qr.service';

@Module({
  controllers: [BatchesController],
  providers: [BatchesService, QrService],
  exports: [BatchesService],
})
export class BatchesModule {}
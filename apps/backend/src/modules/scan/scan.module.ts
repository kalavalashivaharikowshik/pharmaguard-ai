import { Module } from '@nestjs/common';

import { BlockchainModule } from '../blockchain/blockchain.module';
import { ScanHistoryModule } from '../scan-history/scan-history.module';
import { ScanController } from './scan.controller';
import { ScanService } from './scan.service';

@Module({
  imports: [BlockchainModule, ScanHistoryModule],
  controllers: [ScanController],
  providers: [ScanService],
})
export class ScanModule {}

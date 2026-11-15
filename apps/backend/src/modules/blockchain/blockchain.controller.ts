import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { BlockchainService } from './blockchain.service';

@Controller('blockchain')
export class BlockchainController {

  constructor(
    private blockchainService: BlockchainService,
  ) {}

  @Get('stats')
  stats() {
    return this.blockchainService.getStats();
  }

  @Get('batch/:batchNumber')
  getBatch(
    @Param('batchNumber')
    batchNumber: string,
  ) {
    return this.blockchainService.getBatch(batchNumber);
  }

  @Get(
    'verify/:batchNumber',
  )
  verifyBatch(
    @Param('batchNumber')
    batchNumber: string,
  ) {
    return this.blockchainService
      .verifyBatch(
        batchNumber,
      );
  }
}

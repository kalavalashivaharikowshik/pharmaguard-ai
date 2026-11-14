import {
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { BlockchainService } from './blockchain.service';

@Controller('blockchain')
export class BlockchainController {

  constructor(
    private blockchainService: BlockchainService,
  ) {}

  @Post('test')
  async test() {

    return this.blockchainService
      .registerBatch(
        'TEST-001',
        'HASH123',
      );
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

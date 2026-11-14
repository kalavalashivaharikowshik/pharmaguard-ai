import {
  Controller,
  Param,
  Post,
  Get,
} from '@nestjs/common';

import { RevocationService } from './revocation.service';

@Controller('revocation')
export class RevocationController {
  constructor(
    private revocationService:
      RevocationService,
  ) {}

  @Get()
  getRevokedBatches() {
   return this.revocationService
     .getRevokedBatches();
  }

  @Get('summary')
  summary() {
    return this.revocationService
      .getSummary();
  }

  @Post(':batchId')
  revoke(
    @Param('batchId')
    batchId: string,
  ) {
    return this.revocationService
      .revokeBatch(
        batchId,
        'MANUAL_TEST',
      );
  }
}
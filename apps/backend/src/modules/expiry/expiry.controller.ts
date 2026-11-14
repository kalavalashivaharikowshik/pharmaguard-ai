import {
  Controller,
  Post,
} from '@nestjs/common';

import { ExpiryService } from './expiry.service';

@Controller('expiry')
export class ExpiryController {
  constructor(
    private expiryService: ExpiryService,
  ) {}

  @Post('check')
  checkExpiry() {
    return this.expiryService
      .checkExpiringBatches();
  }
}
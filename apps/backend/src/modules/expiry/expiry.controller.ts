import {
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { ExpiryService } from './expiry.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Expiry')
@ApiBearerAuth()
@Controller('expiry')
export class ExpiryController {
  constructor(
    private expiryService: ExpiryService,
  ) {}

  /** Manual trigger. The same check also runs automatically every day. */
  @Post('check')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.REGULATOR)
  checkExpiry() {
    return this.expiryService
      .checkExpiringBatches();
  }
}

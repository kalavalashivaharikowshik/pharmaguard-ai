import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

import { RevocationService } from './revocation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditService } from '../audit/audit.service';

class RevokeBatchDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;
}

@ApiTags('Revocation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('revocation')
export class RevocationController {
  constructor(
    private revocationService: RevocationService,
    private audit: AuditService,
  ) {}

  @Get()
  getRevokedBatches() {
    return this.revocationService.getRevokedBatches();
  }

  @Get('summary')
  summary() {
    return this.revocationService.getSummary();
  }

  /** Manual revocation by oversight roles (also revokes on-chain). */
  @Post(':batchId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.REGULATOR)
  async revoke(
    @Param('batchId') batchId: string,
    @Body() dto: RevokeBatchDto,
    @CurrentUser() user: any,
  ) {
    const reason = dto.reason?.trim() || 'MANUAL_REVOCATION';
    const batch = await this.revocationService.revokeBatch(batchId, reason);
    await this.audit.log({
      userId: user.userId,
      action: 'BATCH_REVOKED_MANUALLY',
      entity: 'BATCH',
      entityId: batchId,
      description: `Batch manually revoked: ${reason}.`,
    });
    return batch;
  }
}

import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';


import { UserRole } from '@prisma/client';

import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { ComplianceService } from './compliance.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiTags('Compliance')
@ApiBearerAuth()
@Controller('compliance')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  UserRole.REGULATOR,
  UserRole.SUPER_ADMIN,
)
export class ComplianceController {
  constructor(
    private complianceService: ComplianceService,
  ) {}

  /** Violation log: blocked sales, tampering, overdue recalls, unknown products. */
  @Get('violations')
  getViolations(@Query('type') type?: string) {
    return this.complianceService.getViolations(type);
  }

  @Get('summary')
  getSummary() {
    return this.complianceService.getSummary();
  }

  @Get('recalls')
  getRecallReport() {
    return this.complianceService.getRecallReport();
  }

  @Get('expiry')
  getExpiryReport() {
    return this.complianceService.getExpiryReport();
  }

  @Get('transfers')
  getTransferReport() {
    return this.complianceService.getTransferReport();
  }

}
import {
  Controller,
  Get,
  Res,
  UseGuards,
} from '@nestjs/common';


import { UserRole } from '@prisma/client';

import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { ComplianceService } from './compliance.service';


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
import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../../common/guards/roles.guard';

import { Roles } from '../../common/decorators/roles.decorator';

import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {

  constructor(
    private auditService: AuditService,
  ) {}

  @Get()
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.REGULATOR,
  )
  getLogs() {

    return this.auditService.getLogs();

  }

}
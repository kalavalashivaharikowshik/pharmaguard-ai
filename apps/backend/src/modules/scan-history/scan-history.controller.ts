import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../../common/guards/roles.guard';

import { Roles } from '../../common/decorators/roles.decorator';

import { CurrentUser } from '../../common/decorators/current-user.decorator';

import { ScanHistoryService } from './scan-history.service';

@Controller('scan-history')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class ScanHistoryController {

  constructor(
    private scanHistoryService: ScanHistoryService,
  ) {}

  @Get('my')
  getMyHistory(

    @CurrentUser()
    user: any,

  ) {

    return this.scanHistoryService.getUserHistory(

      user.userId,

    );

  }

  @Get('network')
  @Roles(
    'SUPER_ADMIN',
    'REGULATOR',
  )
  getNetworkHistory() {

    return this.scanHistoryService.getNetworkHistory();

  }

}
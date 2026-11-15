import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private dashboardService: DashboardService,
  ) {}

  @Get('summary')
  getSummary(@CurrentUser() user: any) {
    return this.dashboardService.getSummary(user.userId, user.role);
  }
}

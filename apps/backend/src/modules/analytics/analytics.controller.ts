import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../../common/guards/roles.guard';

import { Roles } from '../../common/decorators/roles.decorator';

import { AnalyticsService } from './analytics.service';

import { AnalyticsFilterDto } from './dto/analytics-filter.dto';
import { SafetyAnalyticsService } from './safety-analytics.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class AnalyticsController {

  constructor(
    private analyticsService: AnalyticsService,
    private safety: SafetyAnalyticsService,
  ) {}

  @Get('dashboard')
  @Roles(
    'SUPER_ADMIN',
    'REGULATOR',
  )
  getDashboardAnalytics(
    @Query()
    filter: AnalyticsFilterDto,
  ) {

    const year =
      filter.year
        ? Number(filter.year)
        : undefined;

    return this.analyticsService.getDashboardAnalytics(
      year,
    );

  }

  /** Map-based stock visibility (optionally only holders of one recall). */
  @Get('stock-map')
  @Roles('SUPER_ADMIN', 'REGULATOR', 'MANUFACTURER')
  stockMap(@Query('recallId') recallId?: string) {
    return this.safety.stockMap(recallId);
  }

  @Get('safety-metrics')
  @Roles('SUPER_ADMIN', 'REGULATOR')
  safetyMetrics() {
    return this.safety.safetyMetrics();
  }
}

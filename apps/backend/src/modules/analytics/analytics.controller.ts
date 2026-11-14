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

@Controller('analytics')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class AnalyticsController {

  constructor(
    private analyticsService: AnalyticsService,
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

}
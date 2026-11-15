import { Module } from '@nestjs/common';

import { AnalyticsController } from './analytics.controller';

import { AnalyticsService } from './analytics.service';
import { SafetyAnalyticsService } from './safety-analytics.service';

@Module({

  controllers: [
    AnalyticsController,
  ],

  providers: [
    AnalyticsService,
    SafetyAnalyticsService,
  ],

  exports: [
    AnalyticsService,
  ],

})
export class AnalyticsModule {}
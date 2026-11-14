import { Module } from '@nestjs/common';

import { ScanHistoryController } from './scan-history.controller';

import { ScanHistoryService } from './scan-history.service';

@Module({

  controllers: [

    ScanHistoryController,

  ],

  providers: [

    ScanHistoryService,

  ],

  exports: [

    ScanHistoryService,

  ],

})

export class ScanHistoryModule {}
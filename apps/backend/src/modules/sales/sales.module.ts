import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';

import { BlockchainModule } from '../blockchain/blockchain.module';

import { ScanHistoryModule } from '../scan-history/scan-history.module';

import { SalesController } from './sales.controller';

import { SalesService } from './sales.service';

@Module({

  imports: [

    PrismaModule,

    BlockchainModule,

    ScanHistoryModule,

  ],

  controllers: [

    SalesController,

  ],

  providers: [

    SalesService,

  ],

})

export class SalesModule {}
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';

import { PrismaModule } from './prisma/prisma.module';
import { ChainModule } from './modules/chain/chain.module';
import { InfraModule } from './modules/infra/infra.module';
import { DisposalModule } from './modules/disposal/disposal.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ManufacturersModule } from './modules/manufacturers/manufacturers.module';
import { BatchesModule } from './modules/batches/batches.module';
import { RecallsModule } from './modules/recalls/recalls.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ExpiryModule } from './modules/expiry/expiry.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { AiModule } from './modules/ai/ai.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { SalesModule } from './modules/sales/sales.module';
import { RevocationModule } from './modules/revocation/revocation.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { RegistrationModule } from './modules/registration/registration.module';
import { EmailModule } from './modules/email/email.module';
import { AuditModule } from './modules/audit/audit.module';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { DeviceTokensModule } from './modules/device-tokens/device-tokens.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ScanHistoryModule } from './modules/scan-history/scan-history.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ScheduleModule.forRoot(),

    // Global rate limit: 300 requests / minute per IP (login has a stricter limit).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),

    InfraModule,

    PrismaModule,
    ChainModule,
    FirebaseModule,
    DeviceTokensModule,
    AuthModule,
    UsersModule,
    ManufacturersModule,
    BatchesModule,
    RecallsModule,
    NotificationsModule,
    TransfersModule,
    InventoryModule,
    ExpiryModule,
    ComplianceModule,
    AiModule,
    BlockchainModule,
    SalesModule,
    RevocationModule,
    DashboardModule,
    RegistrationModule,
    EmailModule,
    AuditModule,
    AnalyticsModule,
    ScanHistoryModule,
    ReportsModule,
    DisposalModule,
  ],

  controllers: [
    AppController,
  ],

  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
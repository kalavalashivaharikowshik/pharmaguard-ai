import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';

import { RevocationModule } from '../revocation/revocation.module';

import { ExpiryController } from './expiry.controller';
import { ExpiryService } from './expiry.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    RevocationModule,
    NotificationsModule,
  ],

  controllers: [
    ExpiryController,
  ],

  providers: [
    ExpiryService,
  ],
})
export class ExpiryModule {}
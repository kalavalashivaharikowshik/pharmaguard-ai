import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { NotificationsController } from './notifications.controller';
import { FirebaseModule } from '../firebase/firebase.module';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway }
from './notifications.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({

  imports: [

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),

    FirebaseModule,

  ],
  controllers: [
    NotificationsController,
  ],

  providers: [
    NotificationsService,
    NotificationsGateway,
  ],

  exports: [
    NotificationsService,
  ],
})
export class NotificationsModule {}
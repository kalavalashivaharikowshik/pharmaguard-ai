import { Module } from '@nestjs/common';

import { NotificationsController } from './notifications.controller';
import { FirebaseModule } from '../firebase/firebase.module';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway }
from './notifications.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({

  imports: [

    JwtModule.register({

      secret: 'pharmaguard-super-secret-key',

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
import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';

import { RegistrationController } from './registration.controller';

import { RegistrationService } from './registration.service';

import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';
import { AuditModule } from '../audit/audit.module';

@Module({

  imports: [

    PrismaModule,

    NotificationsModule,

    EmailModule,

    AuditModule,

  ],

  controllers: [

    RegistrationController,

  ],

  providers: [

    RegistrationService,

  ],

  exports: [

    RegistrationService,

  ],

  

})
export class RegistrationModule {}
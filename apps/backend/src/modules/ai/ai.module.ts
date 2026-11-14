import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';

import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { RevocationModule }
from '../revocation/revocation.module';

@Module({
  imports: [
    PrismaModule,
    RevocationModule,
  ],

  controllers: [
    AiController,
  ],

  providers: [
    AiService,
  ],
})
export class AiModule {}
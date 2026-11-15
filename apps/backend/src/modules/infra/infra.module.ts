import { Global, Module } from '@nestjs/common';

import { CacheService } from './cache.service';
import { QueueService } from './queue.service';
import { SmsService } from './sms.service';
import { ViolationsService } from './violations.service';

@Global()
@Module({
  providers: [CacheService, QueueService, SmsService, ViolationsService],
  exports: [CacheService, QueueService, SmsService, ViolationsService],
})
export class InfraModule {}

import { Module } from '@nestjs/common';

import { RevocationModule } from '../revocation/revocation.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GeminiService } from './gemini.service';
import { InsightsService } from './insights.service';
import { RecallAgentService } from './recall-agent.service';

@Module({
  imports: [RevocationModule, NotificationsModule, AuditModule],
  controllers: [AiController],
  providers: [AiService, GeminiService, InsightsService, RecallAgentService],
  exports: [RecallAgentService, InsightsService, GeminiService],
})
export class AiModule {}

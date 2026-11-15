import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { GeminiService } from './gemini.service';
import { InsightsService } from './insights.service';
import { RecallAgentService } from './recall-agent.service';
import { ChatDto, CompleteTaskDto } from './dto/chat.dto';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiController {
  constructor(
    private aiService: AiService,
    private insights: InsightsService,
    private recallAgent: RecallAgentService,
    private gemini: GeminiService,
  ) {}

  @Get('status')
  status() {
    return {
      provider: 'Google Gemini',
      enabled: this.gemini.enabled,
      model: this.gemini.model,
      agents: ['Recall Agent', 'Inventory Agent', 'Compliance Agent', 'Notification Agent', 'Summary Agent'],
    };
  }

  /** Risk scores, forecasts, stock predictions and recommendations for the current user. */
  @Get('insights')
  getInsights(@CurrentUser() user: any) {
    return this.insights.insights(user.userId, user.role);
  }

  @Get('risks')
  risks(@CurrentUser() user: any) {
    return this.insights.batchRisks(user.userId, user.role);
  }

  @Get('batches/:batchId/risk')
  batchRisk(@Param('batchId') batchId: string, @CurrentUser() user: any) {
    return this.insights.batchRisk(batchId, user.userId, user.role);
  }

  @Get('forecast')
  forecast(@CurrentUser() user: any) {
    return this.insights.inventoryForecast(user.userId, user.role);
  }

  /** Role-aware assistant. Limited to 20 messages per minute per client. */
  @Post('chat')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  chat(@Body() dto: ChatDto, @CurrentUser() user: any) {
    return this.insights.chat(user.userId, user.role, dto.message, dto.history ?? []);
  }

  // ------------------------------------------------------------ recall agents

  @Post('recall/:recallId/run-agent')
  @Roles(UserRole.REGULATOR, UserRole.SUPER_ADMIN)
  runAgent(@Param('recallId') recallId: string) {
    return this.recallAgent.run(recallId);
  }

  @Get('recall/:recallId/impact')
  getImpact(@Param('recallId') recallId: string) {
    return this.aiService.getRecallImpact(recallId);
  }

  @Get('recall/:recallId/summary')
  getSummary(@Param('recallId') recallId: string) {
    return this.aiService.getRecallSummary(recallId);
  }

  @Get('recall/:recallId/tasks')
  @Roles(UserRole.REGULATOR, UserRole.SUPER_ADMIN, UserRole.MANUFACTURER)
  listTasks(@Param('recallId') recallId: string) {
    return this.aiService.listRecallTasks(recallId);
  }

  @Get('my-tasks')
  myTasks(@CurrentUser() user: any) {
    return this.aiService.myTasks(user.userId);
  }

  @Patch('tasks/:taskId/complete')
  completeTask(@Param('taskId') taskId: string, @Body() dto: CompleteTaskDto, @CurrentUser() user: any) {
    return this.aiService.completeTask(taskId, user.userId, user.role, dto.notes);
  }

  @Post('recall/:recallId/finalize')
  @Roles(UserRole.REGULATOR, UserRole.SUPER_ADMIN)
  finalizeRecall(@Param('recallId') recallId: string) {
    return this.aiService.finalizeRecall(recallId);
  }

  @Post('recall/monitor')
  @Roles(UserRole.REGULATOR, UserRole.SUPER_ADMIN)
  monitor() {
    return this.recallAgent.monitor();
  }
}

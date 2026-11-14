import {
  Controller,
  Get,
  Param,
  Post,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(
  UserRole.REGULATOR,
  UserRole.SUPER_ADMIN,
)
export class AiController {
  constructor(
    private aiService: AiService,
  ) {}

  @Post(
    'recall/:recallId/tasks',
  )
  createTasks(
    @Param('recallId')
    recallId: string,
  ) {
    return this.aiService
      .createRecallTasks(
        recallId,
      );
  }

  @Get(
    'recall/:recallId/impact',
  )
  getImpact(
    @Param('recallId')
    recallId: string,
  ) {
    return this.aiService
      .getRecallImpact(
        recallId,
      );
  }

  @Get(
    'recall/:recallId/summary',
  )
  getSummary(
    @Param('recallId')
    recallId: string,
  ) {
    return this.aiService
      .generateRecallSummary(
        recallId,
      );
  }

  @Patch(
    'tasks/:taskId/complete',
  )
  completeTask(
    @Param('taskId')
    taskId: string,
  ) {
    return this.aiService
      .completeTask(
        taskId,
      );
  }

  @Post(
    'recall/:recallId/finalize',
  )
  finalizeRecall(
    @Param('recallId')
    recallId: string,
  ) {
    return this.aiService
      .finalizeRecall(
        recallId,
      );
  }
}
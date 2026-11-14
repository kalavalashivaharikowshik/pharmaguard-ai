import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  UserRole,
} from '@prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

import { CreateRecallDto } from './dto/create-recall.dto';
import { RecallsService } from './recalls.service';

@Controller('recalls')
export class RecallsController {
  constructor(
    private recallsService: RecallsService,
  ) {}

  @Post()
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    UserRole.REGULATOR,
    UserRole.SUPER_ADMIN,
  )
  create(
    @Body()
    dto: CreateRecallDto,
  ) {
    return this.recallsService.create(
      dto,
    );
  }

  @Get()
  findAll() {
    return this.recallsService.findAll();
  }

  @Get(':id/summary')
  summary(
    @Param('id')
    id: string,
  ) {
    return this.recallsService
      .getSummary(id);
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.recallsService.findOne(
      id,
    );
  }

}
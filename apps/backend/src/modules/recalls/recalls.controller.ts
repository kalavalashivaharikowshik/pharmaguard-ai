import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  UserRole,
} from '@prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

import { CreateRecallDto, UpdateRecallDto } from './dto/create-recall.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RecallsService } from './recalls.service';

@ApiTags('Recalls')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.REGULATOR, UserRole.SUPER_ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRecallDto,
    @CurrentUser() user: any,
  ) {
    return this.recallsService.update(id, dto, user.userId);
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

import { CreateBatchDto } from './dto/create-batch.dto';
import { BatchesService } from './batches.service';

import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('batches')
export class BatchesController {
  constructor(
    private batchesService: BatchesService,
  ) {}

  @Post()
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.MANUFACTURER)
  create(
    @Body()
    dto: CreateBatchDto,

    @CurrentUser()
    user: any,
  ) {
    return this.batchesService.create(
      dto,
      user.userId,
    );
  }

  @Get()
  findAll() {
    return this.batchesService.findAll();
  }

  // IMPORTANT: MUST BE ABOVE @Get(':id')
  @Get('verify/:qrCode')
  verify(
    @Param('qrCode')
    qrCode: string,
  ) {
    return this.batchesService.verify(
      qrCode,
    );
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.batchesService.findOne(
      id,
    );
  }
}
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateBatchDto, UpdateBatchDto } from './dto/create-batch.dto';
import { BatchesService } from './batches.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Batches')
@ApiBearerAuth()
@Controller('batches')
export class BatchesController {
  constructor(
    private batchesService: BatchesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANUFACTURER)
  create(
    @Body() dto: CreateBatchDto,
    @CurrentUser() user: any,
  ) {
    return this.batchesService.create(dto, user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.REGULATOR, UserRole.MANUFACTURER)
  findAll(@CurrentUser() user: any) {
    return this.batchesService.findAll(user.userId, user.role);
  }

  /** Public: anyone (e.g. a patient) can verify a QR code. Must stay above ':id'. */
  @Get('verify/:qrCode')
  verify(
    @Param('qrCode') qrCode: string,
  ) {
    return this.batchesService.verify(qrCode);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @Param('id') id: string,
  ) {
    return this.batchesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANUFACTURER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBatchDto,
    @CurrentUser() user: any,
  ) {
    return this.batchesService.update(id, dto, user.userId);
  }
}

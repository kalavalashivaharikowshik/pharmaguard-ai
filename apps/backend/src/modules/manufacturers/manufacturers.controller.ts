import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { ManufacturersService } from './manufacturers.service';
import { UseGuards } from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { Roles } from '../../common/decorators/roles.decorator';

import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('manufacturers')
export class ManufacturersController {
  constructor(
    private readonly manufacturersService: ManufacturersService,
  ) {}

  @Post()
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(UserRole.SUPER_ADMIN)
  create(
    @Body()
    dto: CreateManufacturerDto,
  ) {
    return this.manufacturersService.create(
      dto,
    );
  }

  @Get()
  findAll() {
    return this.manufacturersService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.manufacturersService.findOne(
      id,
    );
  }
}
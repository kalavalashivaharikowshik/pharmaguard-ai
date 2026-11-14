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

import { RolesGuard } from '../../common/guards/roles.guard';

import { Roles } from '../../common/decorators/roles.decorator';

import { CurrentUser } from '../../common/decorators/current-user.decorator';

import { CreateTransferDto } from './dto/create-transfer.dto';

import { TransfersService } from './transfers.service';

@Controller('transfers')
export class TransfersController {
  constructor(
    private transfersService: TransfersService,
  ) {}

  @Post()
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    UserRole.MANUFACTURER,
    UserRole.DISTRIBUTOR,
  )
  create(
    @Body()
    dto: CreateTransferDto,

    @CurrentUser()
    user: any,
  ) {
    return this.transfersService.create(
      dto,
      user.userId,
    );
  }

  @Get()
  @UseGuards(
    JwtAuthGuard,
  )
  findAll(

    @CurrentUser()
    user: any,

  ) {

    return this.transfersService.findAll(

      user.userId,

      user.role,

    );

  }

  @Get('users')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    UserRole.MANUFACTURER,
    UserRole.DISTRIBUTOR,
  )
  getTransferUsers(

    @CurrentUser()
    user: any,

  ) {

    return this.transfersService.getTransferUsers(

      user.userId,

    );

  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.transfersService.findOne(
      id,
    );
  }
  
}


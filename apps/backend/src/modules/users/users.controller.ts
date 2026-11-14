import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { CreateUserDto }
from './dto/create-user.dto';

import { JwtAuthGuard }
from '../auth/guards/jwt-auth.guard';

import { CurrentUser }
from '../../common/decorators/current-user.decorator';

import { UsersService }
from './users.service';

import {
  Param,
} from '@nestjs/common';

import { ChangePasswordDto }
from './dto/change-password.dto';

@Controller('users')
export class UsersController {

  constructor(
    private usersService: UsersService,
  ) {}

  @Get('me')
  @UseGuards(
    JwtAuthGuard,
  )
  getProfile(
    @CurrentUser()
    user: any,
  ) {

    return this.usersService.getProfile(
      user.userId,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getAllUsers() {
    return this.usersService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createUser(
    @Body()
    dto: CreateUserDto,
  ) {

    const hashedPassword =
      await bcrypt.hash(
        dto.password,
        10,
      );

    return this.usersService.createUser({
      ...dto,
      password:
        hashedPassword,
    });

  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard)
  updateRole(
    @Param('id')
    id: string,

    @Body()
    body: {
      role: UserRole;
    },
  ) {

    return this.usersService.updateRole(
      id,
      body.role,
    );

  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('id')
    id: string,

    @Body()
    body: {
      status: string;
    },
  ) {

    return this.usersService.updateStatus(
      id,
      body.status as any,
    );

  }

  @Patch('password')
  @UseGuards(
    JwtAuthGuard,
  )
  changePassword(
    @CurrentUser()
    user: any,

    @Body()
    dto: ChangePasswordDto,
  ) {

    return this.usersService.changePassword(
      user.userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
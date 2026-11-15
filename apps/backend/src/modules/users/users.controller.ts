import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import {
  CreateUserDto,
  UpdatePreferencesDto,
  UpdateProfileDto,
  UpdateRoleDto,
  UpdateStatusDto,
} from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ------------------------------------------------------------ own account

  @Get('me')
  getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.userId);
  }

  @Patch('me')
  updateMyProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.userId, dto, user.userId);
  }

  @Patch('me/preferences')
  updatePreferences(@CurrentUser() user: any, @Body() dto: UpdatePreferencesDto) {
    return this.usersService.updatePreferences(user.userId, dto);
  }

  @Patch('password')
  changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.userId, dto.currentPassword, dto.newPassword);
  }

  /** Alias used by older mobile builds. */
  @Patch('change-password')
  changePasswordAlias(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    return this.changePassword(user, dto);
  }

  // ------------------------------------------------------- user management

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.REGULATOR)
  getAllUsers() {
    return this.usersService.findAll();
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  async createUser(@Body() dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.usersService.createUser({ ...dto, password: hashedPassword, isVerified: true });
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  updateUser(@Param('id') id: string, @Body() dto: UpdateProfileDto, @CurrentUser() user: any) {
    return this.usersService.updateProfile(id, dto, user.userId);
  }

  @Patch(':id/role')
  @Roles(UserRole.SUPER_ADMIN)
  updateRole(@Param('id') id: string, @Body() body: UpdateRoleDto, @CurrentUser() user: any) {
    if (id === user.userId) throw new ForbiddenException('You cannot change your own role.');
    return this.usersService.updateRole(id, body.role);
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN)
  updateStatus(@Param('id') id: string, @Body() body: UpdateStatusDto, @CurrentUser() user: any) {
    if (id === user.userId) throw new ForbiddenException('You cannot change your own status.');
    return this.usersService.updateStatus(id, body.status);
  }
}

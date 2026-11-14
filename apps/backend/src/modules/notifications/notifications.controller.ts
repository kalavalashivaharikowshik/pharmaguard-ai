import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CurrentUser } from '../../common/decorators/current-user.decorator';

import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private notificationsService: NotificationsService,
  ) {}

  @Get('my')
  @UseGuards(
    JwtAuthGuard,
  )
  getMyNotifications(
    @CurrentUser()
    user: any,
  ) {
    return this.notificationsService
      .getUserNotifications(
        user.userId,
      );
  }

  @Get(':id')
  @UseGuards(
    JwtAuthGuard,
  )
  findOne(

    @Param('id')
    id: string,

    @CurrentUser()
    user: any,

  ) {

    return this.notificationsService.findOne(

      id,

      user.userId,

    );

  }

  @Get('unread-count')
  @UseGuards(
    JwtAuthGuard,
  )
  getUnreadCount(
    @CurrentUser()
    user: any,
  ) {

    return this.notificationsService.getUnreadCount(
      user.userId,
    );

  }

  @Patch(':id/read')
  @UseGuards(
    JwtAuthGuard,
  )
  markAsRead(

    @Param('id')
    id: string,

    @CurrentUser()
    user: any,

  ) {

    return this.notificationsService.markAsRead(

      id,

      user.userId,

    );

  }

  @Patch('read-all')
  @UseGuards(
    JwtAuthGuard,
  )
  markAllAsRead(

    @CurrentUser()
    user: any,

  ) {

    return this.notificationsService.markAllAsRead(

      user.userId,

    );

  }

  @Delete(':id')
  @UseGuards(
    JwtAuthGuard,
  )
  deleteNotification(

    @Param('id')
    id: string,

    @CurrentUser()
    user: any,

  ) {

    return this.notificationsService.deleteNotification(

      id,

      user.userId,

    );

  }
}
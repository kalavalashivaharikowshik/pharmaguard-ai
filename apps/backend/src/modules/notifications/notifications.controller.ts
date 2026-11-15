import { Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

// Fixed paths ("my", "unread-count", "read-all") must be declared before the
// ":id" routes, otherwise ":id" captures them.
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get('my')
  getMyNotifications(@CurrentUser() user: any) {
    return this.notificationsService.getUserNotifications(user.userId);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: any) {
    return this.notificationsService.getUnreadCount(user.userId);
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificationsService.findOne(id, user.userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificationsService.markAsRead(id, user.userId);
  }

  @Delete(':id')
  deleteNotification(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificationsService.deleteNotification(id, user.userId);
  }
}

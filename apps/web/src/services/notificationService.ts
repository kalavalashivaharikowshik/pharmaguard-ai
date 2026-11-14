import { api } from './api';

import type {
  Notification,
} from '../types/notification';

export const notificationService = {

  async getMyNotifications(): Promise<Notification[]> {

    const response =
      await api.get<Notification[]>(
        '/notifications/my',
      );

    return response.data;

  },

  async getUnreadCount(): Promise<{ unread: number }> {

    const response =
      await api.get<{ unread: number }>(
        '/notifications/unread-count',
      );

    return response.data;

  },

  async markAsRead(
    id: string,
  ) {

    const response =
      await api.patch(
        `/notifications/${id}/read`,
      );

    return response.data;

  },

  async markAllAsRead() {

    const response =
      await api.patch(
        '/notifications/read-all',
      );

    return response.data;

  },

  async deleteNotification(
    id: string,
  ) {

    const response =
      await api.delete(
        `/notifications/${id}`,
      );

    return response.data;

  },

};
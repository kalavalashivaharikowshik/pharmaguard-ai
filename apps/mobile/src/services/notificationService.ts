import { api } from './api';

import type { Notification } from '../types/notification';
import { cacheStorage } from '../storage/cacheStorage';
import { notificationEvents } from '../utils/notificationEvents';

export const notificationService = {

  async getNotifications(): Promise<Notification[]> {

    try {

      const response =
        await api.get<Notification[]>(
          '/notifications/my',
        );

      await cacheStorage.save(
        'notifications',
        response.data,
      );

      return response.data;

    }

    catch {

      const cached =
        await cacheStorage.get<Notification[]>(
          'notifications',
        );

      return cached ?? [];

    }

  },

  async getNotification(
    id: string,
  ): Promise<Notification> {

    try {

      const response =
        await api.get(
          `/notifications/${id}`,
        );

      return response.data;

    }

    catch {

      const cached =
        await cacheStorage.get<Notification[]>(
          'notifications',
        );

      const notification =
        cached?.find(
          item => item.id === id,
        );

      if (!notification) {

        throw new Error(
          'Notification not found.',
        );

      }

      return notification;

    }

  },

  async getUnreadCount() {

    const response =
      await api.get(
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

    const cached =
      await cacheStorage.get<Notification[]>(
        'notifications',
      );

    if (cached) {

      const updated = cached.map(item =>

        item.id === id

          ? {

              ...item,

              isRead: true,

              status: 'READ',

            }

          : item,

      );

      await cacheStorage.save(
        'notifications',
        updated,
      );

      notificationEvents.emit();

    }

    return response.data;

  },

  async markAllAsRead() {

    const response =
      await api.patch(
        '/notifications/read-all',
      );

    const cached =
      await cacheStorage.get<Notification[]>(
        'notifications',
      );

    if (cached) {

      const updated = cached.map(item => ({

        ...item,

        isRead: true,

        status: 'READ',

      }));

      await cacheStorage.save(
        'notifications',
        updated,
      );

      notificationEvents.emit();

    }

    return response.data;

  },

  async deleteNotification(
    id: string,
  ) {

    const response =
      await api.delete(
        `/notifications/${id}`,
      );

    const cached =
      await cacheStorage.get<Notification[]>(
        'notifications',
      );

    if (cached) {

      await cacheStorage.save(

        'notifications',

        cached.filter(

          item => item.id !== id,

        ),

      );

      notificationEvents.emit();

    }

    return response.data;

  },

  navigateFromAction(actionUrl?: string) {

    switch (actionUrl) {

      case '/inventory':

        return {

          parent: 'Main',

          screen: 'Inventory',

        };

      case '/transfers':

        return {

          parent: 'Main',

          screen: 'Transfers',

        };

      case '/recalls':

        return {

          parent: 'Main',

          screen: 'Recalls',

        };

      case '/notifications':

        return {

          parent: 'Main',

          screen: 'Notifications',

        };

      case '/settings':

        return {

          parent: 'Profile',

        };

      default:

        return undefined;

    }

  },

};
import { api } from './api';
import { cacheStorage } from '../storage/cacheStorage';

export const dashboardService = {

  async getSummary() {

    try {

      const response =
        await api.get('/dashboard/summary');

      await cacheStorage.save(
        'dashboard-summary',
        response.data,
      );

      return response.data;

    }

    catch {

      return (
        await cacheStorage.get(
          'dashboard-summary',
        )
      ) ?? {};

    }

  },

  async getNotifications() {

    try {

      const response =
        await api.get('/notifications/my');

      await cacheStorage.save(
        'dashboard-notifications',
        response.data,
      );

      return response.data;

    }

    catch {

      return (
        await cacheStorage.get(
          'dashboard-notifications',
        )
      ) ?? [];

    }

  },

  async getTransfers() {

    try {

      const response =
        await api.get('/transfers');

      await cacheStorage.save(
        'dashboard-transfers',
        response.data,
      );

      return response.data;

    }

    catch {

      return (
        await cacheStorage.get(
          'dashboard-transfers',
        )
      ) ?? [];

    }

  },

  async getRecalls() {

    try {

      const response =
        await api.get('/recalls');

      await cacheStorage.save(
        'dashboard-recalls',
        response.data,
      );

      return response.data;

    }

    catch {

    return (

      await cacheStorage.get(
        'dashboard-summary',
      )

    ) ?? {

      inventoryUnits: 0,

      activeRecalls: 0,

      activeBatches: 0,

      notifications: 0,

    };

  }

  },

};
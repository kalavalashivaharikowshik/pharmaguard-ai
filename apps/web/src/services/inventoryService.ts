import { api } from './api';

export const inventoryService = {

  async getInventory() {

    const role =
      localStorage.getItem(
        'role',
      );

    const endpoint =
      role === 'SUPER_ADMIN' ||
      role === 'REGULATOR'
        ? '/inventory/network'
        : '/inventory/my';

    const response =
      await api.get(
        endpoint,
      );

    return response.data;
  },

};
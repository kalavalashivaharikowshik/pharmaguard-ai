import { api } from './api';

export const revocationService = {

  async getAll() {

    const response =
      await api.get(
        '/revocation',
      );

    return response.data;
  },

  async getSummary() {

    const response =
      await api.get(
        '/revocation/summary',
      );

    return response.data;
  },

};
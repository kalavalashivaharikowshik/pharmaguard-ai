import { api } from './api';

export const recallService = {
  async getAll() {
    const response =
      await api.get('/recalls');

    return response.data;
  },

  async getSummary(
    recallId: string,
  ) {
    const response =
      await api.get(
        `/recalls/${recallId}/summary`,
      );

    return response.data;
  },
};
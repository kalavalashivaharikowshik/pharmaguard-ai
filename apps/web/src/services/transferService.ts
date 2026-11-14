import { api } from './api';

export const transferService = {

  async getAll() {

    const response =
      await api.get(
        '/transfers',
      );

    return response.data;

  },

  async getTransferUsers() {

    const response =
      await api.get(
        '/transfers/users',
      );

    return response.data;

  },

  async createTransfer(
    data: {
      batchId: string;
      toUserId: string;
      quantity: number;
    },
  ) {

    const response =
      await api.post(
        '/transfers',
        data,
      );

    return response.data;

  },

};
import { api } from './api';

export const batchService = {

  async getAll() {

    const response =
      await api.get('/batches');

    return response.data;
  },

  async create(data: {
    drugName: string;
    batchNumber: string;
    manufactureDate: string;
    expiryDate: string;
    quantity: number;
  }) {

    const response =
      await api.post(
        '/batches',
        data,
      );

    return response.data;
  },

};
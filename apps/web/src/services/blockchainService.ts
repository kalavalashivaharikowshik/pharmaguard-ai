import { api } from './api';

export const blockchainService = {

  async verify(
    batchNumber: string,
  ) {

    const response =
      await api.get(
        `/blockchain/verify/${batchNumber}`,
      );

    return response.data;
  },

};
import { api } from './api';

export const scannerService = {

  async verifyBatch(

    batchNumber: string,

  ) {

    const response =
      await api.get(
        `/blockchain/verify/${batchNumber}`,
      );

    return response.data;

  },

};
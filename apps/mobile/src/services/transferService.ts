import { api } from './api';
import NetInfo from '@react-native-community/netinfo';

import { transferQueue } from '../storage/transferQueue';
export const transferService = {

  async getTransfers() {

    try {

      const response =
        await api.get('/transfers');

      await transferQueue.saveCache(
        response.data,
      );

      return response.data;

    }

    catch {

      return (
        await transferQueue.getCache()
      ) ?? [];

    }

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

    const state =

      await NetInfo.fetch();

    if (!state.isConnected) {

      await transferQueue.add(data);

      return {

        queued: true,

      };

    }

    const response =

      await api.post(

        '/transfers',

        data,

      );

    return response.data;

  },

};
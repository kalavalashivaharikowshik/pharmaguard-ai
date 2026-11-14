import NetInfo from '@react-native-community/netinfo';

import { api } from './api';

import {

  transferQueue,

} from '../storage/transferQueue';

export const transferSyncService = {

  async sync() {

    const state =

      await NetInfo.fetch();

    if (!state.isConnected) {

      return;

    }

    const queue =

      await transferQueue.get();

    if (!queue.length) {

      return;

    }

    for (const transfer of queue) {

      try {

        await api.post(

          '/transfers',

          transfer,

        );

      }

      catch {

        return;

      }

    }

    await transferQueue.clear();

  },

};
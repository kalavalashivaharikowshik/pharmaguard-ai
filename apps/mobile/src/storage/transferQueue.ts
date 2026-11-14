import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'offline-transfer-queue';

export interface OfflineTransfer {

  batchId: string;

  toUserId: string;

  quantity: number;

}

export const transferQueue = {

  async get(): Promise<OfflineTransfer[]> {

    const value =

      await AsyncStorage.getItem(KEY);

    return value

      ? JSON.parse(value)

      : [];

  },

  async add(

    transfer: OfflineTransfer,

  ) {

    const queue =

      await this.get();

    queue.push(transfer);

    await AsyncStorage.setItem(

      KEY,

      JSON.stringify(queue),

    );

  },

  async clear() {

    await AsyncStorage.removeItem(KEY);

  },

  async saveCache(
    transfers: any[],
    ) {

    await AsyncStorage.setItem(
        'cachedTransfers',
        JSON.stringify(transfers),
    );

    },

    async getCache() {

    const value =
        await AsyncStorage.getItem(
        'cachedTransfers',
        );

    return value
        ? JSON.parse(value)
        : null;

    },

};
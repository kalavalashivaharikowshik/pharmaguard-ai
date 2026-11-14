import AsyncStorage from '@react-native-async-storage/async-storage';

export const cacheStorage = {

  async save<T>(
    key: string,
    data: T,
  ) {

    await AsyncStorage.setItem(

      `cache:${key}`,

      JSON.stringify(data),

    );

  },

  async get<T>(
    key: string,
  ): Promise<T | null> {

    const value =

      await AsyncStorage.getItem(

        `cache:${key}`,

      );

    if (!value) {

      return null;

    }

    return JSON.parse(value);

  },

  async remove(
    key: string,
  ) {

    await AsyncStorage.removeItem(

      `cache:${key}`,

    );

  },

  async clear() {

    const keys =

      await AsyncStorage.getAllKeys();

    const cacheKeys =

      keys.filter(key =>

        key.startsWith('cache:'),

      );

    await AsyncStorage.multiRemove(

      cacheKeys,

    );

  },

};
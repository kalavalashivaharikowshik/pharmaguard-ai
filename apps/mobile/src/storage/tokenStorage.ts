import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'pg_token';

const REMEMBER_KEY = 'pg_remember';

export const tokenStorage = {

  async save(
    token: string,
    remember: boolean,
  ) {

    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [REMEMBER_KEY, String(remember)],
    ]);

  },

  async get() {

    return AsyncStorage.getItem(
      TOKEN_KEY,
    );

  },

  async shouldRemember() {

    const value =
      await AsyncStorage.getItem(
        REMEMBER_KEY,
      );

    return value === 'true';

  },

  async clear() {

    await AsyncStorage.multiRemove([
      TOKEN_KEY,
      REMEMBER_KEY,
    ]);

  },

};
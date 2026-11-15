import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'pg_token';
const REMEMBER_KEY = 'pg_remember';

/**
 * The JWT lives in the device's secure enclave (Keychain / Android Keystore)
 * via expo-secure-store. Older installs kept it in AsyncStorage; it is moved
 * across on first read.
 */
async function secureAvailable() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export const tokenStorage = {
  async save(token: string, remember: boolean) {
    if (await secureAvailable()) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await AsyncStorage.removeItem(TOKEN_KEY);
    } else {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }
    await AsyncStorage.setItem(REMEMBER_KEY, String(remember));
  },

  async get() {
    if (await secureAvailable()) {
      const secure = await SecureStore.getItemAsync(TOKEN_KEY);
      if (secure) return secure;
      const legacy = await AsyncStorage.getItem(TOKEN_KEY);
      if (legacy) {
        await SecureStore.setItemAsync(TOKEN_KEY, legacy);
        await AsyncStorage.removeItem(TOKEN_KEY);
      }
      return legacy;
    }
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  async shouldRemember() {
    const value = await AsyncStorage.getItem(REMEMBER_KEY);
    return value === 'true';
  },

  async clear() {
    if (await secureAvailable()) {
      await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => undefined);
    }
    await AsyncStorage.multiRemove([TOKEN_KEY, REMEMBER_KEY]);
  },
};

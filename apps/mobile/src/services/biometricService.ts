import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

const ENABLED_KEY = 'pg_biometrics_enabled';

export type BiometricKind = 'fingerprint' | 'face' | 'iris' | 'none';

/** Fingerprint / Face ID unlock for a remembered session. */
export const biometricService = {
  /** True when the device has biometric hardware and the user has enrolled. */
  async isAvailable(): Promise<boolean> {
    try {
      const [hardware, enrolled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);
      return hardware && enrolled;
    } catch {
      return false;
    }
  },

  async kind(): Promise<BiometricKind> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'face';
      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'fingerprint';
      if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) return 'iris';
    } catch {
      /* ignore */
    }
    return 'none';
  },

  async isEnabled(): Promise<boolean> {
    return (await AsyncStorage.getItem(ENABLED_KEY)) === 'true';
  },

  async setEnabled(enabled: boolean) {
    await AsyncStorage.setItem(ENABLED_KEY, String(enabled));
  },

  /** Shows the system prompt. Resolves true on success. */
  async authenticate(reason = 'Unlock PharmaGuard AI'): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use passcode',
        disableDeviceFallback: false,
      });
      if (result.success) return { success: true };
      return { success: false, error: result.error };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  },
};

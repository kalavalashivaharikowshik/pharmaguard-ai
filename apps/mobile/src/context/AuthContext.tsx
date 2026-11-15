import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import Toast from 'react-native-toast-message';
import {
  getMessaging,
  getToken,
} from '@react-native-firebase/messaging';

import { authService } from '../services/authService';
import { api } from '../services/api';
import { tokenStorage } from '../storage/tokenStorage';
import type { User } from '../types/auth';
import { registerLogoutHandler } from '../utils/sessionManager';
import { firebaseMessagingService } from '../services/firebaseMessagingService';
import { biometricService } from '../services/biometricService';

interface AuthContextType {
  loading: boolean;

  initializing: boolean;

  authenticated: boolean;
  /** True when a remembered session is waiting for fingerprint / Face ID. */
  locked: boolean;
  unlock(): Promise<boolean>;
  user: User | null;

  login(
    email: string,
    password: string,
    remember: boolean,
  ): Promise<void>;

  logout(): Promise<void>;
}

const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType,
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    initializing,
    setInitializing,
  ] = useState(true);

  const [
    authenticated,
    setAuthenticated,
  ] = useState(false);

  const [
    user,
    setUser,
  ] = useState<User | null>(
    null,
  );

  const [locked, setLocked] = useState(false);

  async function unlock() {
    const result = await biometricService.authenticate();
    if (result.success) setLocked(false);
    return result.success;
  }

  useEffect(() => {

    registerLogoutHandler(logout);

    restoreSession();

  }, []);

  async function restoreSession() {

    const remember =
      await tokenStorage.shouldRemember();

    if (!remember) {

      await tokenStorage.clear();

      setAuthenticated(false);

      setUser(null);

      setInitializing(false);

      return;

    }

    const token =
      await tokenStorage.get();

    if (token) {

      try {

        const user =
          await authService.me();

        setUser(user);
        setAuthenticated(true);
        // Biometric unlock for remembered sessions (toggle in Settings).
        if (
          (await biometricService.isEnabled()) &&
          (await biometricService.isAvailable())
        ) {
          setLocked(true);
        }

        await firebaseMessagingService.registerDevice();

        firebaseMessagingService.listenTokenRefresh();

        firebaseMessagingService.listenForegroundMessages();

      } catch {

        await tokenStorage.clear();

        setAuthenticated(false);

        setUser(null);

      }

    }

    setInitializing(false);

  }

    async function login(
    email: string,
    password: string,
    remember: boolean,
  ) {

    try {

      setLoading(true);

      const response =
        await authService.login({
          email,
          password,
        });

      await tokenStorage.save(
        response.accessToken,
        remember,
      );

      setUser(response.user);

      setAuthenticated(true);

      // await firebaseMessagingService.registerDevice();

      // firebaseMessagingService.listenTokenRefresh();

      // firebaseMessagingService.listenForegroundMessages();

      Toast.show({

        type: 'success',

        text1: 'Welcome',

        text2: response.user.fullName,

      });

    } catch (error: any) {

      console.log("========== LOGIN ERROR ==========");
      console.log(error);
      console.log("message:", error?.message);
      console.log("response:", error?.response);
      console.log("data:", error?.response?.data);
      console.log("status:", error?.response?.status);
      console.log("=================================");

      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2:
          error?.response?.data?.message ??
          error?.message ??
          "Unknown Error",
      });

    } finally {

      setLoading(false);

    }

  }

  async function logout() {

    try {

      const token =
        await getToken(
          getMessaging(),
        );

      await api.delete(
        `/device-tokens/${encodeURIComponent(token)}`,
      );

    } catch {

      try {

      const token =
        await getToken(
          getMessaging(),
        );

      await api.delete(
        `/device-tokens/${encodeURIComponent(token)}`,
      );

    }

    catch {

    }

    }

    await tokenStorage.clear();

    setLocked(false);

    setAuthenticated(false);

    setUser(null);

    Toast.show({

      type: 'success',

      text1: 'Signed Out',

      text2: 'See you again.',

    });

  }

  return (

    <AuthContext.Provider
      value={{
        loading,
        initializing,
        authenticated,
        locked,
        unlock,
        user,
        login,
        logout,
      }}
    >

      {children}

    </AuthContext.Provider>

  );

}

export const useAuth = () =>
  useContext(AuthContext);
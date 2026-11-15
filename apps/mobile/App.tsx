import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  NetworkProvider,
} from './src/context/NetworkContext';

import {
  AuthProvider,
  useAuth,
} from './src/context/AuthContext';

import { useEffect } from 'react';

import NetInfo from '@react-native-community/netinfo';

import { appSyncService } from './src/services/appSyncService';

import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import SplashScreen from './src/screens/auth/SplashScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';

import OfflineBanner from './src/components/common/OfflineBanner';

import Toast from 'react-native-toast-message';

import MainNavigator from './src/navigation/MainNavigator';
import BiometricLockScreen from './src/screens/auth/BiometricLockScreen';

import './src/services/interceptors';

function Root() {

  useEffect(() => {

    NetInfo.fetch().then(state => {

      if (state.isConnected) {

        appSyncService.sync();

      }

    });

    const unsubscribe =

      NetInfo.addEventListener(state => {

        if (state.isConnected) {

          appSyncService.sync();

        }

      });

    return unsubscribe;

  }, []);

  const {
    initializing,
    authenticated,
    locked,
    login,
    loading,
  } = useAuth();

  const [
    showForgotPassword,
    setShowForgotPassword,
  ] = useState(false);

  const [
    showWelcome,
    setShowWelcome,
  ] = useState(true);

  if (initializing) {
    return <SplashScreen />;
  }

  if (authenticated && locked) {
    return <BiometricLockScreen />;
  }

  if (!authenticated) {

    if (showWelcome) {

      return (

        <WelcomeScreen
          onContinue={() =>
            setShowWelcome(false)
          }
        />

      );

    }

    if (showForgotPassword) {

      return (

        <ForgotPasswordScreen
          onBack={() =>
            setShowForgotPassword(false)
          }
        />

      );

    }

    return (

      <LoginScreen
        onLogin={login}
        loading={loading}
        onForgotPassword={() =>
          setShowForgotPassword(true)
        }
      />

    );

  }

  return <MainNavigator />;

}

export default function App() {

  return (

    <SafeAreaProvider>

      <StatusBar
        style="dark"
        backgroundColor="#FFFFFF"
        translucent={false}
      />

      <NetworkProvider>

        <OfflineBanner />

        <AuthProvider>

          <Root />

        </AuthProvider>

      </NetworkProvider>

      <Toast />

    </SafeAreaProvider>

  );

}
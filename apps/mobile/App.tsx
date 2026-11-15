import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import Toast, { BaseToast, ErrorToast, type ToastConfig } from 'react-native-toast-message';

import { NetworkProvider } from './src/context/NetworkContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { appSyncService } from './src/services/appSyncService';
import { ThemeProvider, useTheme, brand } from './src/ui/theme';
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import SplashScreen from './src/screens/auth/SplashScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import BiometricLockScreen from './src/screens/auth/BiometricLockScreen';
import OfflineBanner from './src/components/common/OfflineBanner';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import AppNavigator from './src/navigation/AppNavigator';
import './src/services/interceptors';

function Root() {
  useEffect(() => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected) appSyncService.sync();
    });
    return NetInfo.addEventListener((state) => {
      if (state.isConnected) appSyncService.sync();
    });
  }, []);

  const { initializing, authenticated, locked, login, loading } = useAuth();
  const [showForgot, setShowForgot] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  if (initializing) return <SplashScreen />;
  if (authenticated && locked) return <BiometricLockScreen />;
  if (!authenticated) {
    if (showWelcome) return <WelcomeScreen onContinue={() => setShowWelcome(false)} />;
    if (showForgot) return <ForgotPasswordScreen onBack={() => setShowForgot(false)} />;
    return <LoginScreen onLogin={login} loading={loading} onForgotPassword={() => setShowForgot(true)} />;
  }
  return <AppNavigator />;
}

function ThemedToast() {
  const { c } = useTheme();
  const base = {
    style: { borderLeftWidth: 5, borderRadius: 12, backgroundColor: c.surface, height: undefined, minHeight: 60, paddingVertical: 10 },
    text1Style: { fontSize: 15, fontWeight: '700' as const, color: c.text },
    text2Style: { fontSize: 13, color: c.textMuted },
    text2NumberOfLines: 3,
  };
  const config: ToastConfig = {
    success: (p) => <BaseToast {...p} {...base} style={[base.style, { borderLeftColor: brand.green }]} />,
    error: (p) => <ErrorToast {...p} {...base} style={[base.style, { borderLeftColor: c.danger }]} />,
    info: (p) => <BaseToast {...p} {...base} style={[base.style, { borderLeftColor: brand.blue }]} />,
  };
  return <Toast config={config} topOffset={56} />;
}

export default function App() {
  return (
    <ErrorBoundary>
    <SafeAreaProvider>
      <ThemeProvider>
        <NetworkProvider>
          <AuthProvider>
            <Root />
          </AuthProvider>
          <OfflineBanner />
        </NetworkProvider>
        <ThemedToast />
      </ThemeProvider>
    </SafeAreaProvider>
    </ErrorBoundary>
  );
}

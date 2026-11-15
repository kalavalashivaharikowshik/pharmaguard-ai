import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** PharmaGuard design tokens, shared with the web dashboard. */
export const brand = {
  blue: '#0F4C81',
  blueDark: '#0A2540',
  blueMid: '#155A94',
  blueLight: '#4A8BC4',
  green: '#2E8B57',
  greenLight: '#5FBF8A',
};

const light = {
  mode: 'light' as const,
  bg: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  border: '#E2E8F0',
  text: '#0F172A',
  textMuted: '#64748B',
  textSoft: '#94A3B8',
  primary: brand.blue,
  primarySoft: '#EAF2FA',
  onPrimary: '#FFFFFF',
  success: '#2E8B57',
  successSoft: '#E7F5EE',
  warning: '#D97706',
  warningSoft: '#FEF3E2',
  danger: '#DC2626',
  dangerSoft: '#FDECEC',
  info: '#2563EB',
  infoSoft: '#E8F0FE',
  overlay: 'rgba(15,23,42,0.5)',
  tabBar: '#FFFFFF',
  shadow: '#0F172A',
};

const dark: typeof light = {
  ...light,
  mode: 'dark' as any,
  bg: '#0B1220',
  surface: '#141F35',
  surfaceAlt: '#1B2840',
  border: '#24324D',
  text: '#F1F5F9',
  textMuted: '#9AA8BD',
  textSoft: '#6B7A93',
  primary: '#5B9BD5',
  primarySoft: 'rgba(91,155,213,0.16)',
  success: '#5FBF8A',
  successSoft: 'rgba(95,191,138,0.16)',
  warning: '#FBBF24',
  warningSoft: 'rgba(251,191,36,0.14)',
  danger: '#F87171',
  dangerSoft: 'rgba(248,113,113,0.15)',
  info: '#60A5FA',
  infoSoft: 'rgba(96,165,250,0.15)',
  overlay: 'rgba(0,0,0,0.6)',
  tabBar: '#101A2E',
  shadow: '#000000',
};

export type Colors = typeof light;
export type ThemeMode = 'light' | 'dark' | 'system';

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };
export const font = {
  h1: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '800' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '700' as const },
  title: { fontSize: 16, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyStrong: { fontSize: 15, fontWeight: '600' as const },
  small: { fontSize: 13, fontWeight: '500' as const },
  tiny: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.4 },
};

interface ThemeValue {
  c: Colors;
  isDark: boolean;
  mode: ThemeMode;
  setMode(m: ThemeMode): void;
}

const ThemeContext = createContext<ThemeValue | null>(null);
const KEY = 'pg_theme_mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v === 'light' || v === 'dark' || v === 'system') setModeState(v);
    });
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(KEY, m).catch(() => undefined);
  }, []);

  const isDark = mode === 'system' ? system === 'dark' : mode === 'dark';
  const value = useMemo(() => ({ c: isDark ? dark : light, isDark, mode, setMode }), [isDark, mode, setMode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

/** Theme-aware StyleSheet: const useStyles = makeStyles((c) => ({ ... })); */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (c: Colors, isDark: boolean) => T) {
  return () => {
    const { c, isDark } = useTheme();
    return useMemo(() => StyleSheet.create(factory(c, isDark)), [c, isDark]);
  };
}

export function shadow(c: Colors, level: 1 | 2 = 1) {
  return {
    shadowColor: c.shadow,
    shadowOpacity: c.mode === 'light' ? (level === 1 ? 0.06 : 0.12) : 0.35,
    shadowRadius: level === 1 ? 8 : 16,
    shadowOffset: { width: 0, height: level === 1 ? 2 : 6 },
    elevation: level === 1 ? 2 : 6,
  };
}

/** Status colours: Safe → green, Recalled → red, Expired → orange, Pending → yellow, Transferred → blue. */
export function statusTone(status?: string): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  switch ((status ?? '').toUpperCase()) {
    case 'ACTIVE':
    case 'SAFE':
    case 'COMPLETED':
    case 'APPROVED':
    case 'VERIFIED':
    case 'LOW':
      return 'success';
    case 'RECALLED':
    case 'REVOKED':
    case 'BLOCKED':
    case 'COUNTERFEIT':
    case 'CRITICAL':
    case 'OVERDUE':
    case 'REJECTED':
    case 'HIGH':
      return 'danger';
    case 'EXPIRED':
    case 'WARNING':
    case 'MEDIUM':
    case 'PENDING':
    case 'NOTICE_ISSUED':
      return 'warning';
    case 'TRANSFERRED':
    case 'RETURNED':
      return 'info';
    default:
      return 'neutral';
  }
}

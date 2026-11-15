import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';

import { T } from '../../ui/components';
import { brand } from '../../ui/theme';

const SHIELD =
  'M512 150 L790 255 C805 261 815 275 815 291 L815 500 C815 680 690 805 523 872 C516 875 508 875 501 872 C334 805 209 680 209 500 L209 291 C209 275 219 261 234 255 Z';

/** PharmaGuard logo: the same shield as the app icon. */
export function ShieldLogo({ size = 84 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="190 140 644 750">
      <Defs>
        <SvgGradient id="pgG" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#4CC38A" />
          <Stop offset="1" stopColor="#2E8B57" />
        </SvgGradient>
        <SvgGradient id="pgS" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.35} />
          <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0} />
        </SvgGradient>
      </Defs>
      <Path d={SHIELD} fill="url(#pgG)" />
      <Path d={SHIELD} fill="url(#pgS)" />
      <Path d="M512 205 L762 299 L762 500 C762 650 660 760 512 822 C364 760 262 650 262 500 L262 299 Z" fill="none" stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={10} />
      <Path d="M378 515 L475 612 L660 427" fill="none" stroke="#FFFFFF" strokeWidth={76} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Animated logo mark used on the splash and sign-in screens. */
export function LogoMark({ size = 84, animate = true }: { size?: number; animate?: boolean }) {
  const pulse = useRef(new Animated.Value(animate ? 0.85 : 1)).current;
  useEffect(() => {
    if (!animate) return;
    Animated.spring(pulse, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }).start();
  }, [pulse, animate]);
  return (
    <Animated.View style={[styles.logo, { transform: [{ scale: pulse }] }]}>
      <ShieldLogo size={size} />
    </Animated.View>
  );
}

export function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <LinearGradient colors={[brand.blueDark, brand.blue, brand.blueMid]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <View style={styles.b1} />
      <View style={styles.b2} />
      <View style={styles.b3} />
      {children}
    </LinearGradient>
  );
}

export function Wordmark({ light = true }: { light?: boolean }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <T variant="h1" color={light ? '#FFFFFF' : undefined} style={{ fontSize: 30 }}>
        PharmaGuard <T variant="h1" color={brand.greenLight} style={{ fontSize: 30 }}>AI</T>
      </T>
      <T variant="small" color={light ? 'rgba(255,255,255,0.75)' : undefined} style={{ marginTop: 4 }}>
        Safe medicines, from factory to patient
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { alignItems: 'center', justifyContent: 'center' },
  b1: { position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(46,139,87,0.22)', top: -120, right: -100 },
  b2: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(255,255,255,0.05)', bottom: 80, left: -110 },
  b3: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(95,191,138,0.14)', bottom: -40, right: 30 },
});

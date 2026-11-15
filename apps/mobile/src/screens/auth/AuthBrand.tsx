import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon, T } from '../../ui/components';
import { brand } from '../../ui/theme';

/** Animated PharmaGuard logo mark. */
export function LogoMark({ size = 84, animate = true }: { size?: number; animate?: boolean }) {
  const pulse = useRef(new Animated.Value(animate ? 0.85 : 1)).current;
  useEffect(() => {
    if (!animate) return;
    Animated.spring(pulse, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }).start();
  }, [pulse, animate]);
  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <LinearGradient colors={[brand.green, brand.greenLight]} style={[styles.logo, { width: size, height: size, borderRadius: size * 0.3 }]}>
        <Icon name="shield-check" size={size * 0.55} color="#FFFFFF" />
      </LinearGradient>
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
  logo: { alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
  b1: { position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(46,139,87,0.22)', top: -120, right: -100 },
  b2: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(255,255,255,0.05)', bottom: 80, left: -110 },
  b3: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(95,191,138,0.14)', bottom: -40, right: 30 },
});

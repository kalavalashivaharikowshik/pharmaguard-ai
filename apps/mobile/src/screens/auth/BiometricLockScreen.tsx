import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { biometricService, type BiometricKind } from '../../services/biometricService';
import { COLORS } from '../../utils/theme';

/** Shown when a remembered session needs fingerprint / Face ID before opening. */
export default function BiometricLockScreen() {
  const { unlock, logout, user } = useAuth();
  const [kind, setKind] = useState<BiometricKind>('fingerprint');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const tryUnlock = async () => {
    setBusy(true);
    const ok = await unlock();
    setFailed(!ok);
    setBusy(false);
  };

  useEffect(() => {
    biometricService.kind().then(setKind);
    tryUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.icon}>
        <MaterialIcons name={kind === 'face' ? 'face' : 'fingerprint'} size={56} color={COLORS.white} />
      </View>
      <Text style={styles.title}>PharmaGuard AI is locked</Text>
      <Text style={styles.subtitle}>
        {user?.fullName ? `Welcome back, ${user.fullName}. ` : ''}Use {kind === 'face' ? 'Face ID' : 'your fingerprint'} to continue.
      </Text>
      {failed && <Text style={styles.error}>Authentication failed. Try again.</Text>}
      <TouchableOpacity style={styles.button} onPress={tryUnlock} disabled={busy} accessibilityRole="button">
        {busy ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Unlock</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={logout} accessibilityRole="button">
        <Text style={styles.link}>Sign in with password instead</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: COLORS.background },
  icon: { width: 104, height: 104, borderRadius: 52, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  subtitle: { marginTop: 8, fontSize: 15, color: COLORS.subtitle, textAlign: 'center', lineHeight: 22 },
  error: { marginTop: 12, color: COLORS.danger, fontWeight: '600' },
  button: { marginTop: 28, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', alignSelf: 'stretch' },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  link: { marginTop: 18, color: COLORS.primary, fontWeight: '600' },
});

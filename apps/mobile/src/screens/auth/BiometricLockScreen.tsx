import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../context/AuthContext';
import { biometricService, type BiometricKind } from '../../services/biometricService';
import { AuthBackground } from './AuthBrand';
import { Avatar, Button, Icon, T, haptic } from '../../ui/components';
import { space } from '../../ui/theme';

export default function BiometricLockScreen() {
  const { unlock, logout, user } = useAuth();
  const [kind, setKind] = useState<BiometricKind>('fingerprint');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const tryUnlock = async () => {
    setBusy(true);
    const ok = await unlock();
    if (ok) haptic.success();
    else haptic.error();
    setFailed(!ok);
    setBusy(false);
  };

  useEffect(() => {
    biometricService.kind().then(setKind);
    tryUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthBackground>
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl }}>
        <Avatar name={user?.fullName} size={76} />
        <T variant="h2" color="#FFF" center style={{ marginTop: space.lg }}>
          Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
        </T>
        <T color="rgba(255,255,255,0.8)" center style={{ marginTop: 6 }}>
          PharmaGuard AI is locked
        </T>
        <Pressable onPress={tryUnlock} style={{ marginTop: 48, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }} accessibilityLabel="Unlock">
          <Icon name={kind === 'face' ? 'face-recognition' : 'fingerprint'} size={64} color="#FFF" />
        </Pressable>
        <T color={failed ? '#FCA5A5' : 'rgba(255,255,255,0.8)'} style={{ marginTop: space.lg }}>
          {failed ? 'Not recognised. Tap to try again.' : `Use ${kind === 'face' ? 'Face ID' : 'your fingerprint'} to unlock`}
        </T>
        <View style={{ alignSelf: 'stretch', marginTop: 48, gap: space.sm }}>
          <Button title="Unlock" icon="lock-open-variant-outline" variant="success" loading={busy} onPress={tryUnlock} />
          <Button title="Use password instead" variant="ghost" color="#FFFFFF" onPress={logout} />
        </View>
      </SafeAreaView>
    </AuthBackground>
  );
}

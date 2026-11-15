import { useEffect, useState } from 'react';
import { Linking, Pressable, Switch, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';

import { biometricService, type BiometricKind } from '../../services/biometricService';
import { preferencesService } from '../../services/aiService';
import { API_URL } from '../../config';
import { Card, Header, Icon, type IconName, ListRow, Screen, T, haptic } from '../../ui/components';
import { brand, radius, space, useTheme, type ThemeMode } from '../../ui/theme';

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'te', label: 'తెలుగు' },
];

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { c, mode, setMode } = useTheme();
  const [bioAvail, setBioAvail] = useState(false);
  const [bioOn, setBioOn] = useState(false);
  const [bioKind, setBioKind] = useState<BiometricKind>('none');
  const [prefs, setPrefs] = useState<Record<string, any>>({});

  useEffect(() => {
    biometricService.isAvailable().then(setBioAvail);
    biometricService.isEnabled().then(setBioOn);
    biometricService.kind().then(setBioKind);
    preferencesService.get().then(setPrefs).catch(() => undefined);
  }, []);

  const toggleBio = async (v: boolean) => {
    if (v) {
      const r = await biometricService.authenticate('Confirm to enable biometric login');
      if (!r.success) return Toast.show({ type: 'error', text1: 'Biometric check failed' });
    }
    await biometricService.setEnabled(v);
    setBioOn(v);
    haptic.success();
  };

  const savePref = async (patch: Record<string, unknown>) => {
    setPrefs((p) => ({ ...p, ...patch }));
    preferencesService.update(patch).catch(() => Toast.show({ type: 'error', text1: 'Could not save (offline?)' }));
  };

  const sw = (value: boolean, onChange: (v: boolean) => void, disabled?: boolean) => (
    <Switch value={value} onValueChange={onChange} disabled={disabled} trackColor={{ true: brand.blue, false: c.border }} thumbColor="#FFFFFF" />
  );

  const themes: { value: ThemeMode; label: string; icon: IconName }[] = [
    { value: 'light', label: 'Light', icon: 'white-balance-sunny' },
    { value: 'dark', label: 'Dark', icon: 'weather-night' },
    { value: 'system', label: 'System', icon: 'cellphone' },
  ];

  return (
    <Screen>
      <Header title="Settings" onBack={() => navigation.goBack()} />

      <T variant="tiny" muted style={{ marginBottom: space.sm }}>
        APPEARANCE
      </T>
      <Card style={{ flexDirection: 'row', gap: space.sm, padding: space.md }}>
        {themes.map((t) => {
          const active = mode === t.value;
          return (
            <Pressable
              key={t.value}
              onPress={() => {
                haptic.tap();
                setMode(t.value);
                savePref({ theme: t.value });
              }}
              style={{ flex: 1, alignItems: 'center', gap: 6, paddingVertical: space.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: active ? c.primary : c.border, backgroundColor: active ? c.primarySoft : 'transparent' }}
            >
              <Icon name={t.icon} color={active ? c.primary : c.textMuted} />
              <T variant="small" color={active ? c.primary : c.text} style={{ fontWeight: '700' }}>
                {t.label}
              </T>
            </Pressable>
          );
        })}
      </Card>

      <T variant="tiny" muted style={{ marginTop: space.xl, marginBottom: space.sm }}>
        SECURITY
      </T>
      <Card padded={false} style={{ paddingHorizontal: space.lg }}>
        <ListRow
          icon={bioKind === 'face' ? 'face-recognition' : 'fingerprint'}
          title={bioKind === 'face' ? 'Face ID login' : 'Fingerprint login'}
          subtitle={bioAvail ? 'Unlock with biometrics when "Remember me" is on' : 'Not available on this device'}
          right={sw(bioOn, toggleBio, !bioAvail)}
        />
        <ListRow icon="lock-check-outline" iconTone="success" title="Secure storage" subtitle="Session kept in the device keychain" />
        <ListRow icon="lock-reset" title="Change password" onPress={() => navigation.navigate('ChangePassword')} last />
      </Card>

      <T variant="tiny" muted style={{ marginTop: space.xl, marginBottom: space.sm }}>
        NOTIFICATIONS
      </T>
      <Card padded={false} style={{ paddingHorizontal: space.lg }}>
        <ListRow icon="bell-ring-outline" title="Push notifications" right={sw(prefs.push !== false, (v) => savePref({ push: v }))} />
        <ListRow icon="message-alert-outline" iconTone="danger" title="SMS for urgent alerts" subtitle="High and critical only" right={sw(prefs.sms !== false, (v) => savePref({ sms: v }))} />
        <ListRow icon="email-outline" iconTone="info" title="Email" right={sw(prefs.email !== false, (v) => savePref({ email: v }))} last />
      </Card>

      <T variant="tiny" muted style={{ marginTop: space.xl, marginBottom: space.sm }}>
        LANGUAGE
      </T>
      <Card style={{ flexDirection: 'row', gap: space.sm, padding: space.md }}>
        {LANGS.map((l) => {
          const active = (prefs.language ?? 'en') === l.code;
          return (
            <Pressable
              key={l.code}
              onPress={() => savePref({ language: l.code })}
              style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: radius.md, backgroundColor: active ? brand.blue : c.surfaceAlt }}
            >
              <T variant="bodyStrong" color={active ? '#FFF' : c.text}>
                {l.label}
              </T>
            </Pressable>
          );
        })}
      </Card>

      <T variant="tiny" muted style={{ marginTop: space.xl, marginBottom: space.sm }}>
        ABOUT
      </T>
      <Card padded={false} style={{ paddingHorizontal: space.lg }}>
        <ListRow icon="information-outline" iconTone="neutral" title="Version" right={<T muted>{Constants.expoConfig?.version ?? '1.0.0'}</T>} />
        <ListRow icon="server-network" iconTone="neutral" title="Server" subtitle={API_URL} />
        <ListRow icon="lifebuoy" title="Support" subtitle="support@pharmaguard.ai" onPress={() => Linking.openURL('mailto:support@pharmaguard.ai')} last />
      </Card>
      <View style={{ height: space.xl }} />
    </Screen>
  );
}

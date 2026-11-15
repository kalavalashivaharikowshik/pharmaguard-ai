import { useEffect, useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';

import { biometricService, type BiometricKind } from '../../services/biometricService';
import { preferencesService } from '../../services/aiService';
import { API_URL } from '../../config';
import { COLORS } from '../../utils/theme';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'te', label: 'తెలుగు' },
];

export default function SettingsScreen({ navigation }: any) {
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);
  const [bioKind, setBioKind] = useState<BiometricKind>('none');
  const [prefs, setPrefs] = useState<Record<string, any>>({});

  useEffect(() => {
    biometricService.isAvailable().then(setBioAvailable);
    biometricService.isEnabled().then(setBioEnabled);
    biometricService.kind().then(setBioKind);
    preferencesService
      .get()
      .then(setPrefs)
      .catch(() => undefined);
  }, []);

  const toggleBiometrics = async (value: boolean) => {
    if (value) {
      const res = await biometricService.authenticate('Confirm to enable biometric login');
      if (!res.success) {
        Toast.show({ type: 'error', text1: 'Biometric check failed' });
        return;
      }
    }
    await biometricService.setEnabled(value);
    setBioEnabled(value);
    Toast.show({ type: 'success', text1: value ? 'Biometric login enabled' : 'Biometric login disabled' });
  };

  const savePref = async (patch: Record<string, unknown>) => {
    setPrefs((p) => ({ ...p, ...patch }));
    try {
      await preferencesService.update(patch);
    } catch {
      Toast.show({ type: 'error', text1: 'Could not save preference (offline?)' });
    }
  };

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Back">
          <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Text style={styles.section}>Security</Text>
        <View style={styles.card}>
          <Row
            icon={bioKind === 'face' ? 'face' : 'fingerprint'}
            title={bioKind === 'face' ? 'Face ID login' : 'Fingerprint login'}
            subtitle={bioAvailable ? 'Unlock the app with biometrics when "Remember me" is on' : 'Not available on this device (or no biometrics enrolled)'}
            right={<Switch value={bioEnabled} onValueChange={toggleBiometrics} disabled={!bioAvailable} trackColor={{ true: COLORS.primary }} />}
          />
          <Row icon="lock" title="Secure token storage" subtitle="Your session is kept in the device keychain / keystore" />
        </View>

        <Text style={styles.section}>Notifications</Text>
        <View style={styles.card}>
          <Row icon="notifications" title="Push notifications" right={<Switch value={prefs.push !== false} onValueChange={(v) => savePref({ push: v })} trackColor={{ true: COLORS.primary }} />} />
          <Row icon="sms" title="SMS for urgent alerts" subtitle="High and critical alerts" right={<Switch value={prefs.sms !== false} onValueChange={(v) => savePref({ sms: v })} trackColor={{ true: COLORS.primary }} />} />
          <Row icon="email" title="Email" right={<Switch value={prefs.email !== false} onValueChange={(v) => savePref({ email: v })} trackColor={{ true: COLORS.primary }} />} />
        </View>

        <Text style={styles.section}>Language</Text>
        <View style={[styles.card, { flexDirection: 'row', gap: 8, padding: 12 }]}>
          {LANGUAGES.map((l) => {
            const active = (prefs.language ?? 'en') === l.code;
            return (
              <TouchableOpacity key={l.code} onPress={() => savePref({ language: l.code })} style={[styles.lang, active && styles.langActive]}>
                <Text style={[styles.langText, active && { color: COLORS.white }]}>{l.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.section}>About</Text>
        <View style={styles.card}>
          <Row icon="info" title="App version" subtitle={version} />
          <Row icon="dns" title="Server" subtitle={API_URL} />
          <TouchableOpacity onPress={() => Linking.openURL('mailto:support@pharmaguard.ai?subject=PharmaGuard%20AI%20support')}>
            <Row icon="support-agent" title="Support" subtitle="support@pharmaguard.ai" right={<MaterialIcons name="chevron-right" size={22} color={COLORS.subtitle} />} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Assistant')}>
            <Row icon="smart-toy" title="AI Assistant" subtitle="Ask questions about your stock" right={<MaterialIcons name="chevron-right" size={22} color={COLORS.subtitle} />} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ icon, title, subtitle, right }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <MaterialIcons name={icon} size={22} color={COLORS.primary} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  section: { fontSize: 13, fontWeight: '700', color: COLORS.subtitle, textTransform: 'uppercase', letterSpacing: 0.6 },
  card: { backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border },
  rowTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  rowSubtitle: { fontSize: 12, color: COLORS.subtitle, marginTop: 2 },
  lang: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 10, alignItems: 'center' },
  langActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  langText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
});

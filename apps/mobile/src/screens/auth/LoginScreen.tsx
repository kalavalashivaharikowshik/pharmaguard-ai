import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthBackground, LogoMark, Wordmark } from './AuthBrand';
import { Button, Field, Icon, T } from '../../ui/components';
import { brand, radius, shadow, space, useTheme } from '../../ui/theme';

interface Props {
  onLogin: (email: string, password: string, remember: boolean) => Promise<void> | void;
  loading?: boolean;
  onForgotPassword(): void;
}

export default function LoginScreen({ onLogin, loading, onForgotPassword }: Props) {
  const { c } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address');
    if (!password) return setError('Enter your password');
    await onLogin(email.trim().toLowerCase(), password, remember);
  };

  return (
    <AuthBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: space.xl }} keyboardShouldPersistTaps="handled">
            <View style={{ alignItems: 'center', gap: space.lg, marginBottom: space.xxl }}>
              <LogoMark size={76} />
              <Wordmark />
            </View>

            <View style={[styles.card, { backgroundColor: c.surface }, shadow(c, 2)]}>
              <T variant="h2">Welcome back</T>
              <T muted style={{ marginTop: 4, marginBottom: space.xl }}>
                Sign in to your organisation account
              </T>
              <Field label="Email" icon="email-outline" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="you@organisation.com" />
              <Field
                label="Password"
                icon="lock-outline"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!show}
                autoComplete="password"
                placeholder="Your password"
                onSubmitEditing={submit}
                right={
                  <Pressable onPress={() => setShow((s) => !s)} hitSlop={10} accessibilityLabel={show ? 'Hide password' : 'Show password'}>
                    <Icon name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={c.textMuted} />
                  </Pressable>
                }
              />
              <View style={styles.row}>
                <Pressable onPress={() => setRemember((r) => !r)} style={styles.remember} accessibilityRole="checkbox" accessibilityState={{ checked: remember }}>
                  <Icon name={remember ? 'checkbox-marked' : 'checkbox-blank-outline'} size={22} color={remember ? brand.blue : c.textSoft} />
                  <T variant="small">Remember me</T>
                </Pressable>
                <Pressable onPress={onForgotPassword} hitSlop={8}>
                  <T variant="small" color={c.primary} style={{ fontWeight: '700' }}>
                    Forgot password?
                  </T>
                </Pressable>
              </View>
              {error ? (
                <View style={[styles.error, { backgroundColor: c.dangerSoft }]}>
                  <Icon name="alert-circle-outline" size={18} color={c.danger} />
                  <T variant="small" color={c.danger}>
                    {error}
                  </T>
                </View>
              ) : null}
              <Button title="Sign in" icon="login" loading={loading} onPress={submit} style={{ marginTop: space.lg }} />
            </View>

            <View style={styles.trust}>
              <Icon name="lock-check" size={16} color="rgba(255,255,255,0.75)" />
              <T variant="small" color="rgba(255,255,255,0.75)">
                Secured with JWT · blockchain-verified data
              </T>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, padding: space.xl },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: -4 },
  remember: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  error: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: space.md, borderRadius: radius.md, marginTop: space.lg },
  trust: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: space.xl },
});

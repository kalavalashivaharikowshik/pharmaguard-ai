import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { authService } from '../../services/authService';
import { AuthBackground, LogoMark } from './AuthBrand';
import { Button, Field, Icon, T } from '../../ui/components';
import { radius, shadow, space, useTheme } from '../../ui/theme';
import { errMsg } from '../../ui/format';

export default function ForgotPasswordScreen({ onBack }: { onBack(): void }) {
  const { c } = useTheme();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return Toast.show({ type: 'error', text1: 'Enter a valid email' });
    setLoading(true);
    try {
      await authService.forgotPassword({ email: email.trim().toLowerCase() });
      setSent(true);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Could not send reset link', text2: errMsg(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <Pressable onPress={onBack} style={{ padding: space.lg, flexDirection: 'row', alignItems: 'center', gap: 6 }} accessibilityLabel="Back to sign in">
          <Icon name="arrow-left" color="#FFF" />
          <T variant="bodyStrong" color="#FFF">
            Sign in
          </T>
        </Pressable>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: space.xl }} keyboardShouldPersistTaps="handled">
            <View style={{ alignItems: 'center', marginBottom: space.xl }}>
              <LogoMark size={64} />
            </View>
            <View style={[{ backgroundColor: c.surface, borderRadius: radius.xl, padding: space.xl }, shadow(c, 2)]}>
              {sent ? (
                <View style={{ alignItems: 'center' }}>
                  <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: c.successSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="email-check-outline" size={36} color={c.success} />
                  </View>
                  <T variant="h2" center style={{ marginTop: space.lg }}>
                    Check your email
                  </T>
                  <T muted center style={{ marginTop: 6, marginBottom: space.xl }}>
                    If an account exists for {email}, we've sent a link to reset your password.
                  </T>
                  <Button title="Back to sign in" onPress={onBack} style={{ alignSelf: 'stretch' }} />
                </View>
              ) : (
                <>
                  <T variant="h2">Reset password</T>
                  <T muted style={{ marginTop: 4, marginBottom: space.xl }}>
                    Enter your account email and we'll send you a reset link.
                  </T>
                  <Field label="Email" icon="email-outline" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@organisation.com" onSubmitEditing={submit} />
                  <Button title="Send reset link" icon="send" loading={loading} onPress={submit} />
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AuthBackground>
  );
}

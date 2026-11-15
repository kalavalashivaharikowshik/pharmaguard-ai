import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { api } from '../../services/api';
import { Button, Card, Field, Header, Icon, Screen, T, haptic } from '../../ui/components';
import { space, useTheme } from '../../ui/theme';
import { errMsg } from '../../ui/format';

export default function ChangePasswordScreen() {
  const navigation = useNavigation<any>();
  const { c } = useTheme();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  const rules = [
    { ok: next.length >= 8, label: 'At least 8 characters' },
    { ok: /[A-Za-z]/.test(next) && /\d/.test(next), label: 'Letters and numbers' },
    { ok: !!next && next === confirm, label: 'Passwords match' },
  ];
  const valid = current && rules.every((r) => r.ok);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch('/users/password', { currentPassword: current, newPassword: next });
      haptic.success();
      Toast.show({ type: 'success', text1: 'Password changed' });
      navigation.goBack();
    } catch (e) {
      haptic.error();
      Toast.show({ type: 'error', text1: 'Could not change password', text2: errMsg(e) });
    } finally {
      setSaving(false);
    }
  };

  const eye = (
    <Pressable onPress={() => setShow((s) => !s)} hitSlop={10}>
      <Icon name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color={c.textMuted} />
    </Pressable>
  );

  return (
    <Screen>
      <Header title="Change password" onBack={() => navigation.goBack()} />
      <Card>
        <Field label="Current password" value={current} onChangeText={setCurrent} secureTextEntry={!show} icon="lock-outline" right={eye} />
        <Field label="New password" value={next} onChangeText={setNext} secureTextEntry={!show} icon="lock-plus-outline" />
        <Field label="Confirm new password" value={confirm} onChangeText={setConfirm} secureTextEntry={!show} icon="lock-check-outline" />
        {rules.map((r) => (
          <View key={r.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <Icon name={r.ok ? 'check-circle' : 'circle-outline'} size={18} color={r.ok ? c.success : c.textSoft} />
            <T variant="small" color={r.ok ? c.success : c.textMuted}>
              {r.label}
            </T>
          </View>
        ))}
      </Card>
      <Button title="Update password" icon="content-save" loading={saving} disabled={!valid} onPress={save} style={{ marginTop: space.lg }} />
    </Screen>
  );
}

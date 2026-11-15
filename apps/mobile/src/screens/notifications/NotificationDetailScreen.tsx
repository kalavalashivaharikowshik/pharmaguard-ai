import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { notificationService } from '../../services/notificationService';
import type { Notification } from '../../types/notification';
import { openActionUrl } from '../../navigation/AppNavigator';
import { Badge, Button, Card, Header, Icon, KeyValue, Screen, Skeleton, T, useTone } from '../../ui/components';
import { space } from '../../ui/theme';
import { fmtDateTime } from '../../ui/format';
import { notificationLook } from './notificationLook';

const ACTION_LABEL: Record<string, string> = {
  '/recalls': 'Open recalls',
  '/inventory': 'Open inventory',
  '/transfers': 'Open transfers',
  '/disposals': 'Open disposal notices',
  '/settings': 'Open settings',
};

export default function NotificationDetailScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const [n, setN] = useState<Notification | null>(params?.notification ?? null);

  useEffect(() => {
    notificationService
      .getNotification(params.id)
      .then(setN)
      .catch(() => undefined);
  }, [params.id]);

  const look = notificationLook(n?.type ?? 'SYSTEM', n?.priority ?? 'LOW');
  const t = useTone(look.tone);

  if (!n) {
    return (
      <Screen>
        <Header title="Notification" onBack={() => navigation.goBack()} />
        <Skeleton height={200} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Notification" onBack={() => navigation.goBack()} />
      <Card style={{ alignItems: 'center', paddingVertical: space.xxl }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg }}>
          <Icon name={look.icon} size={34} color={t.fg} />
        </View>
        <T variant="h2" center style={{ marginTop: space.lg }}>
          {n.title}
        </T>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: space.md }}>
          <Badge status={n.priority} />
          <Badge label={n.type} tone="neutral" />
        </View>
        <T center style={{ marginTop: space.lg, lineHeight: 23 }}>
          {n.message}
        </T>
      </Card>
      <Card style={{ marginTop: space.md }}>
        <KeyValue label="Received" value={fmtDateTime(n.createdAt)} />
        {n.metadata?.batchNumber ? <KeyValue label="Batch" value={n.metadata.batchNumber} /> : null}
      </Card>
      {n.actionUrl && ACTION_LABEL[n.actionUrl] && (
        <Button title={ACTION_LABEL[n.actionUrl]} icon="arrow-right" onPress={() => openActionUrl(n.actionUrl)} style={{ marginTop: space.lg }} />
      )}
      <Button
        title="Delete"
        icon="trash-can-outline"
        variant="ghost"
        onPress={async () => {
          await notificationService.deleteNotification(n.id).catch(() => undefined);
          Toast.show({ type: 'success', text1: 'Notification deleted' });
          navigation.goBack();
        }}
        style={{ marginTop: space.sm }}
      />
    </Screen>
  );
}

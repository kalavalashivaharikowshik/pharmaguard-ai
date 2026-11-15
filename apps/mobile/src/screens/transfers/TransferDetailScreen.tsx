import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { api } from '../../services/api';
import { Badge, Card, GradientCard, Header, Icon, KeyValue, Screen, Skeleton, T } from '../../ui/components';
import { space, useTheme } from '../../ui/theme';
import { fmtDate, fmtDateTime, ROLE_LABEL } from '../../ui/format';

export default function TransferDetailScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { c } = useTheme();
  const [t, setT] = useState<any>(params?.transfer ?? null);

  useEffect(() => {
    api
      .get(`/transfers/${params.id}`)
      .then((r) => setT(r.data))
      .catch(() => undefined);
  }, [params.id]);

  if (!t) {
    return (
      <Screen>
        <Header title="Transfer" onBack={() => navigation.goBack()} />
        <Skeleton height={160} />
      </Screen>
    );
  }

  const Party = ({ label, user, icon }: { label: string; user: any; icon: any }) => (
    <View style={styles.party}>
      <View style={[styles.dot, { backgroundColor: c.primarySoft }]}>
        <Icon name={icon} size={20} color={c.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <T variant="tiny" muted>
          {label}
        </T>
        <T variant="title">{user?.organizationName ?? user?.fullName ?? '—'}</T>
        <T variant="small" muted>
          {user?.fullName} · {ROLE_LABEL[user?.role] ?? user?.role}
        </T>
      </View>
    </View>
  );

  return (
    <Screen>
      <Header title="Transfer" onBack={() => navigation.goBack()} right={<Badge status={t.status} />} />
      <GradientCard>
        <T variant="tiny" color="rgba(255,255,255,0.8)">
          QUANTITY
        </T>
        <T variant="h1" color="#FFF" style={{ fontSize: 34 }}>
          {Number(t.quantity).toLocaleString('en-IN')} units
        </T>
        <T color="rgba(255,255,255,0.9)" style={{ marginTop: 4 }}>
          {t.batch?.drugName} · {t.batch?.batchNumber}
        </T>
      </GradientCard>

      <Card style={{ marginTop: space.lg }}>
        <Party label="FROM" user={t.fromUser} icon="arrow-up-bold-circle-outline" />
        <View style={[styles.line, { backgroundColor: c.border }]} />
        <Party label="TO" user={t.toUser} icon="arrow-down-bold-circle-outline" />
      </Card>

      <Card style={{ marginTop: space.md }}>
        <KeyValue label="Date" value={fmtDateTime(t.createdAt)} />
        <KeyValue label="Batch status" value={t.batch?.status} />
        {t.batch?.expiryDate ? <KeyValue label="Expiry" value={fmtDate(t.batch.expiryDate)} /> : null}
        <KeyValue label="Transfer ID" value={t.id.slice(0, 8).toUpperCase()} mono />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  party: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  line: { width: 2, height: 26, marginLeft: 20, marginVertical: 4 },
});

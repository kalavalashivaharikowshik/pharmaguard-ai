import { useCallback, useState } from 'react';
import { Alert, FlatList, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { useAuth } from '../../context/AuthContext';
import { disposalService, type DisposalRecord } from '../../services/disposalService';
import { Badge, Button, Card, Chips, Empty, Header, Icon, ListSkeleton, Screen, T, haptic } from '../../ui/components';
import { radius, space, useTheme } from '../../ui/theme';
import { errMsg, fmtDate } from '../../ui/format';

const REASON: Record<string, string> = {
  EXPIRED: 'Expired',
  RECALL_COMPLETED: 'Recall completed',
  TAMPER_DETECTED: 'Tampering detected',
  MANUAL_REVOCATION: 'Revoked by regulator',
};
type Filter = 'NOTICE_ISSUED' | 'DONE' | 'ALL';

export default function DisposalsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { c } = useTheme();
  const [items, setItems] = useState<DisposalRecord[] | null>(null);
  const [filter, setFilter] = useState<Filter>('NOTICE_ISSUED');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await disposalService.list());
    } catch {
      setItems((v) => v ?? []);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const act = (r: DisposalRecord, status: 'RETURNED' | 'DESTROYED') =>
    Alert.alert(status === 'DESTROYED' ? 'Mark as destroyed?' : 'Mark as returned?', `${r.quantity} units of ${r.batch.drugName} will be removed from your inventory.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            await disposalService.update(r.id, status);
            haptic.success();
            Toast.show({ type: 'success', text1: `Marked ${status.toLowerCase()}` });
            load();
          } catch (e) {
            Toast.show({ type: 'error', text1: 'Could not update', text2: errMsg(e) });
          }
        },
      },
    ]);

  const list = (items ?? []).filter((r) => (filter === 'ALL' ? true : filter === 'DONE' ? r.status !== 'NOTICE_ISSUED' : r.status === 'NOTICE_ISSUED'));

  return (
    <Screen scroll={false}>
      <Header title="Disposal & returns" subtitle="Unsafe stock must leave the supply chain" onBack={() => navigation.goBack()} />
      <Chips<Filter>
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'NOTICE_ISSUED', label: 'Pending', count: items?.filter((r) => r.status === 'NOTICE_ISSUED').length },
          { value: 'DONE', label: 'Completed', count: items?.filter((r) => r.status !== 'NOTICE_ISSUED').length },
          { value: 'ALL', label: 'All', count: items?.length },
        ]}
      />
      {!items ? (
        <View style={{ marginTop: space.lg }}>
          <ListSkeleton />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ paddingTop: space.lg, paddingBottom: 60, gap: space.md }}
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
          ListEmptyComponent={<Empty icon="delete-empty-outline" title="Nothing to dispose" message="Notices appear automatically when a batch you hold is revoked." />}
          renderItem={({ item: r }) => {
            const mine = r.userId === user?.id;
            return (
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: r.status === 'NOTICE_ISSUED' ? c.warningSoft : c.successSoft }}>
                    <Icon name={r.status === 'NOTICE_ISSUED' ? 'delete-clock-outline' : 'check-decagram'} color={r.status === 'NOTICE_ISSUED' ? c.warning : c.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <T variant="title" numberOfLines={1}>
                      {r.batch.drugName}
                    </T>
                    <T variant="small" muted>
                      {r.batch.batchNumber} · {r.quantity} units
                    </T>
                  </View>
                  <Badge status={r.status} label={r.status === 'NOTICE_ISSUED' ? 'Pending' : undefined} size="sm" />
                </View>
                <T variant="small" muted style={{ marginTop: space.md }}>
                  Reason: {REASON[r.reason] ?? r.reason} · issued {fmtDate(r.createdAt)}
                  {!mine ? ` · ${r.user.organizationName ?? r.user.fullName}` : ''}
                </T>
                {mine && r.status !== 'DESTROYED' && (
                  <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.md }}>
                    {r.status === 'NOTICE_ISSUED' && <Button title="Returned" variant="secondary" size="md" onPress={() => act(r, 'RETURNED')} style={{ flex: 1 }} />}
                    <Button title="Destroyed" icon="fire" size="md" onPress={() => act(r, 'DESTROYED')} style={{ flex: 1 }} />
                  </View>
                )}
              </Card>
            );
          }}
        />
      )}
    </Screen>
  );
}

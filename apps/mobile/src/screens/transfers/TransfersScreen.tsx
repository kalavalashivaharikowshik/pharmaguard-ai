import { useCallback, useMemo, useState } from 'react';
import { SectionList, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import { transferService } from '../../services/transferService';
import type { Transfer } from '../../types/transfer';
import { Badge, Button, Card, Chips, Empty, Header, Icon, IconButton, ListSkeleton, Screen, T } from '../../ui/components';
import { radius, space, useTheme } from '../../ui/theme';
import { can, dayGroup, fmtDateTime, ROLE_LABEL } from '../../ui/format';

type Filter = 'ALL' | 'IN' | 'OUT';

export default function TransfersScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { c } = useTheme();
  const [items, setItems] = useState<Transfer[] | null>(null);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => setItems(await transferService.getTransfers()), []);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const isIn = (t: Transfer) => t.toUser?.id === user?.id;
  const filtered = (items ?? []).filter((t) => filter === 'ALL' || (filter === 'IN' ? isIn(t) : !isIn(t)));
  const sections = useMemo(() => {
    const map = new Map<string, Transfer[]>();
    for (const t of filtered) map.set(dayGroup(t.createdAt), [...(map.get(dayGroup(t.createdAt)) ?? []), t]);
    return [...map.entries()].map(([title, data]) => ({ title, data }));
  }, [filtered]);

  return (
    <Screen scroll={false}>
      <Header
        title="Transfers"
        subtitle="Chain of custody for every batch"
        onBack={() => navigation.goBack()}
        right={can.transfer(user?.role) ? <IconButton icon="plus" label="New transfer" onPress={() => navigation.navigate('CreateTransfer')} /> : undefined}
      />
      <Chips<Filter>
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'ALL', label: 'All', count: items?.length },
          { value: 'IN', label: 'Received', count: items?.filter(isIn).length },
          { value: 'OUT', label: 'Sent', count: items?.filter((t) => !isIn(t)).length },
        ]}
      />
      {!items ? (
        <View style={{ marginTop: space.lg }}>
          <ListSkeleton />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(t) => t.id}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingTop: space.md, paddingBottom: 60 }}
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
          ListEmptyComponent={
            <Empty
              icon="truck-outline"
              title="No transfers yet"
              message="Batch movements between organisations show up here."
              action={can.transfer(user?.role) ? <Button title="New transfer" icon="plus" onPress={() => navigation.navigate('CreateTransfer')} /> : undefined}
            />
          }
          renderSectionHeader={({ section }) => (
            <T variant="tiny" muted style={{ marginTop: space.md, marginBottom: space.sm }}>
              {section.title.toUpperCase()}
            </T>
          )}
          renderItem={({ item: t }) => {
            const incoming = isIn(t);
            const other = incoming ? t.fromUser : t.toUser;
            return (
              <Card onPress={() => navigation.navigate('TransferDetail', { id: t.id, transfer: t })} style={{ marginBottom: space.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: incoming ? c.successSoft : c.primarySoft }}>
                    <Icon name={incoming ? 'arrow-bottom-left' : 'arrow-top-right'} color={incoming ? c.success : c.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <T variant="title" numberOfLines={1}>
                      {t.quantity.toLocaleString('en-IN')} × {t.batch.drugName}
                    </T>
                    <T variant="small" muted numberOfLines={1}>
                      {incoming ? 'From' : 'To'} {other?.fullName} · {ROLE_LABEL[other?.role ?? ''] ?? ''}
                    </T>
                  </View>
                  <Badge status={t.status} size="sm" />
                </View>
                <T variant="tiny" muted style={{ marginTop: 10 }}>
                  {t.batch.batchNumber} · {fmtDateTime(t.createdAt)}
                </T>
              </Card>
            );
          }}
        />
      )}
    </Screen>
  );
}

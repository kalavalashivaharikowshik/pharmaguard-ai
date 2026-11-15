import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import { inventoryService } from '../../services/inventoryService';
import type { InventoryBatch } from '../../types/inventory';
import { Badge, Card, Chips, Empty, Header, Icon, IconButton, ListSkeleton, Screen, SearchBar, T } from '../../ui/components';
import { radius, space, statusTone, useTheme } from '../../ui/theme';
import { can, daysUntil, fmtDate } from '../../ui/format';

type Filter = 'ALL' | 'SAFE' | 'EXPIRING' | 'UNSAFE';

export default function InventoryScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { c } = useTheme();
  const [items, setItems] = useState<InventoryBatch[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const network = can.oversight(user?.role);

  const load = useCallback(async () => {
    const data = network ? await inventoryService.getNetworkInventory() : await inventoryService.getMyInventory();
    setItems(data.filter((i) => i.quantity > 0 || network));
  }, [network]);

  useEffect(() => {
    load();
  }, [load]);

  const classify = (i: InventoryBatch): Filter => {
    const s = i.batch.status;
    if (s === 'RECALLED' || s === 'REVOKED' || s === 'EXPIRED' || s === 'DESTROYED' || daysUntil(i.batch.expiryDate) <= 0) return 'UNSAFE';
    if (daysUntil(i.batch.expiryDate) <= 30) return 'EXPIRING';
    return 'SAFE';
  };

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? [])
      .filter((i) => filter === 'ALL' || classify(i) === filter)
      .filter((i) => !q || `${i.batch.drugName} ${i.batch.batchNumber} ${i.batch.manufacturer?.name}`.toLowerCase().includes(q))
      .sort((a, b) => new Date(a.batch.expiryDate).getTime() - new Date(b.batch.expiryDate).getTime());
  }, [items, query, filter]);

  const count = (f: Filter) => (items ?? []).filter((i) => classify(i) === f).length;
  const totalUnits = (items ?? []).reduce((n, i) => n + i.quantity, 0);

  return (
    <Screen scroll={false}>
      <Header
        title="Inventory"
        subtitle={items ? `${totalUnits.toLocaleString('en-IN')} units · ${items.length} batches` : 'Loading…'}
        right={can.transfer(user?.role) ? <IconButton icon="truck-fast-outline" label="New transfer" onPress={() => navigation.navigate('CreateTransfer')} /> : undefined}
      />
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search medicine, batch or manufacturer" />
      <View style={{ marginTop: space.md }}>
        <Chips<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'ALL', label: 'All', count: items?.length },
            { value: 'SAFE', label: 'Safe', count: count('SAFE') },
            { value: 'EXPIRING', label: 'Expiring', count: count('EXPIRING') },
            { value: 'UNSAFE', label: 'Unsafe', count: count('UNSAFE') },
          ]}
        />
      </View>

      {!items ? (
        <View style={{ marginTop: space.lg }}>
          <ListSkeleton />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingTop: space.lg, paddingBottom: 130, gap: space.md }}
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
          ListEmptyComponent={
            <Empty icon="package-variant" title={query || filter !== 'ALL' ? 'No matches' : 'No stock yet'} message={query || filter !== 'ALL' ? 'Try a different search or filter.' : 'Batches transferred to you will appear here.'} />
          }
          renderItem={({ item }) => {
            const days = daysUntil(item.batch.expiryDate);
            const cls = classify(item);
            const accent = cls === 'UNSAFE' ? c.danger : cls === 'EXPIRING' ? c.warning : c.success;
            return (
              <Card onPress={() => navigation.navigate('InventoryDetail', { item })} padded={false} style={{ overflow: 'hidden' }}>
                <View style={[styles.accent, { backgroundColor: accent }]} />
                <View style={{ padding: space.lg, paddingLeft: space.lg + 4 }}>
                  <View style={styles.rowTop}>
                    <View style={[styles.pill, { backgroundColor: c.primarySoft }]}>
                      <Icon name="pill" size={22} color={c.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <T variant="title" numberOfLines={1}>
                        {item.batch.drugName}
                      </T>
                      <T variant="small" muted numberOfLines={1}>
                        {item.batch.batchNumber} · {item.batch.manufacturer?.name}
                      </T>
                    </View>
                    <Badge status={item.batch.status === 'ACTIVE' && cls === 'EXPIRING' ? 'WARNING' : item.batch.status} label={item.batch.status === 'ACTIVE' ? (cls === 'EXPIRING' ? 'Expiring' : 'Safe') : undefined} size="sm" />
                  </View>
                  <View style={[styles.meta, { borderTopColor: c.border }]}>
                    <Meta icon="cube-outline" label="Units" value={item.quantity.toLocaleString('en-IN')} />
                    <Meta icon="calendar-clock" label="Expiry" value={fmtDate(item.batch.expiryDate)} />
                    <Meta
                      icon="timer-sand"
                      label="Left"
                      value={days <= 0 ? 'Expired' : `${days}d`}
                      color={statusTone(cls === 'UNSAFE' ? 'BLOCKED' : cls === 'EXPIRING' ? 'WARNING' : 'SAFE') === 'success' ? undefined : accent}
                    />
                  </View>
                  {network && item.owner && (
                    <T variant="small" muted style={{ marginTop: 8 }}>
                      Held by {item.owner.fullName}
                    </T>
                  )}
                </View>
              </Card>
            );
          }}
        />
      )}
    </Screen>
  );
}

function Meta({ icon, label, value, color }: { icon: any; label: string; value: string; color?: string }) {
  const { c } = useTheme();
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Icon name={icon} size={14} color={c.textMuted} />
        <T variant="tiny" muted>
          {label.toUpperCase()}
        </T>
      </View>
      <T variant="bodyStrong" color={color}>
        {value}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pill: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  meta: { flexDirection: 'row', marginTop: space.md, paddingTop: space.md, borderTopWidth: StyleSheet.hairlineWidth },
});

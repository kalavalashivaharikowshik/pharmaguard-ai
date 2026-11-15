import { useCallback, useEffect, useMemo, useState } from 'react';
import { SectionList, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { scanHistoryService } from '../../services/scanHistoryService';
import type { ScanHistory } from '../../types/scanHistory';
import { Badge, Card, Chips, Empty, Header, Icon, ListSkeleton, Screen, T } from '../../ui/components';
import { space, useTheme } from '../../ui/theme';
import { dayGroup, fmtDateTime } from '../../ui/format';

type Filter = 'ALL' | 'SAFE' | 'BLOCKED';

export default function ScanHistoryScreen() {
  const navigation = useNavigation<any>();
  const { c } = useTheme();
  const [items, setItems] = useState<ScanHistory[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>('ALL');

  const load = useCallback(async () => {
    try {
      setItems(await scanHistoryService.getMyHistory());
    } catch {
      setItems((v) => v ?? []);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = (items ?? []).filter((s) => (filter === 'ALL' ? true : filter === 'SAFE' ? s.verified : !s.verified));
  const sections = useMemo(() => {
    const map = new Map<string, ScanHistory[]>();
    for (const s of filtered) {
      const k = dayGroup(s.scannedAt);
      map.set(k, [...(map.get(k) ?? []), s]);
    }
    return [...map.entries()].map(([title, data]) => ({ title, data }));
  }, [filtered]);

  return (
    <Screen scroll={false}>
      <Header title="Scan history" subtitle={`${items?.length ?? 0} scans`} onBack={() => navigation.goBack()} />
      <Chips<Filter>
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'ALL', label: 'All', count: items?.length },
          { value: 'SAFE', label: 'Safe', count: items?.filter((s) => s.verified).length },
          { value: 'BLOCKED', label: 'Blocked', count: items?.filter((s) => !s.verified).length },
        ]}
      />
      {!items ? (
        <View style={{ marginTop: space.lg }}>
          <ListSkeleton />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(s) => s.id}
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
          contentContainerStyle={{ paddingVertical: space.lg, paddingBottom: 60 }}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={<Empty icon="qrcode-scan" title="No scans yet" message="Medicines you scan will appear here." />}
          renderSectionHeader={({ section }) => (
            <T variant="tiny" muted style={{ marginTop: space.md, marginBottom: space.sm }}>
              {section.title.toUpperCase()}
            </T>
          )}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: space.sm, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: item.verified ? c.successSoft : c.dangerSoft }}>
                <Icon name={item.verified ? 'shield-check' : 'shield-off'} color={item.verified ? c.success : c.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <T variant="bodyStrong" numberOfLines={1}>
                  {item.batch?.drugName ?? item.batchNumber}
                </T>
                <T variant="small" muted>
                  {item.batchNumber} · {fmtDateTime(item.scannedAt)}
                </T>
              </View>
              <Badge status={item.result === 'WARNING' ? 'WARNING' : item.verified ? 'SAFE' : 'BLOCKED'} label={item.result.replace(/_/g, ' ')} size="sm" />
            </Card>
          )}
        />
      )}
    </Screen>
  );
}

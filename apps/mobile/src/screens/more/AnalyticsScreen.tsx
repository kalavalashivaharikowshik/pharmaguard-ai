import { useCallback, useEffect, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { api } from '../../services/api';
import { Card, Header, Screen, Section, Skeleton, StatTile } from '../../ui/components';
import { Bars, Donut } from '../../ui/charts';
import { space } from '../../ui/theme';

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

/** Network analytics for Super Admin / Regulator. */
export default function AnalyticsScreen() {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const [dash, setDash] = useState<any>(null);
  const [safety, setSafety] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [d, s] = await Promise.all([api.get('/analytics/dashboard').then((r) => r.data).catch(() => null), api.get('/analytics/safety-metrics').then((r) => r.data).catch(() => null)]);
    setDash(d);
    setSafety(s);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const month = new Date().getMonth();
  const last6 = Array.from({ length: 6 }, (_, i) => (month - 5 + i + 12) % 12);

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
      }}
    >
      <Header title="Network analytics" subtitle="All organisations" onBack={() => navigation.goBack()} />
      {!dash ? (
        <Skeleton height={300} />
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: space.md }}>
            <StatTile label="Units in network" value={dash.summary.inventory.toLocaleString('en-IN')} icon="package-variant" />
            <StatTile label="Manufacturers" value={dash.summary.manufacturers} icon="factory" tone="neutral" />
          </View>
          <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.md }}>
            <StatTile label="Transfers this year" value={dash.summary.transfers} icon="truck-fast-outline" tone="success" />
            <StatTile label="Recalls this year" value={dash.summary.recalls} icon="shield-alert-outline" tone="danger" />
          </View>

          <Section title="Transfers · last 6 months">
            <Card>
              <Bars width={width - space.lg * 4} data={last6.map((m) => ({ label: MONTHS[m], value: dash.transferTrend.find((t: any) => t.month === m + 1)?.transfers ?? 0 }))} />
            </Card>
          </Section>

          <Section title="Recall severity">
            <Card>
              <Donut
                centerLabel="RECALLS"
                segments={[
                  { label: 'Low', value: dash.recallDistribution.LOW ?? 0, color: '#2E8B57' },
                  { label: 'Medium', value: dash.recallDistribution.MEDIUM ?? 0, color: '#CA8A04' },
                  { label: 'High', value: dash.recallDistribution.HIGH ?? 0, color: '#EA580C' },
                  { label: 'Critical', value: dash.recallDistribution.CRITICAL ?? 0, color: '#DC2626' },
                ]}
              />
            </Card>
          </Section>

          {safety && (
            <Section title="Safety performance">
              <View style={{ flexDirection: 'row', gap: space.md }}>
                <StatTile label="Avg recall time" value={safety.recallPerformance.averageCompletionHours == null ? '—' : `${safety.recallPerformance.averageCompletionHours}h`} icon="timer-outline" />
                <StatTile label="Task completion" value={safety.recallPerformance.taskCompletionRate == null ? '—' : `${safety.recallPerformance.taskCompletionRate}%`} icon="check-decagram" tone="success" />
              </View>
              <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.md }}>
                <StatTile label="Violations (30d)" value={safety.compliance.violationsLast30Days} icon="file-alert-outline" tone="danger" />
                <StatTile label="Suspicious scans" value={safety.counterfeitPrevention.suspiciousDetections} icon="qrcode-remove" tone="warning" hint={`of ${safety.counterfeitPrevention.verificationScans} scans`} />
              </View>
            </Section>
          )}
        </>
      )}
    </Screen>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { aiService } from '../../services/aiService';
import { cacheStorage } from '../../storage/cacheStorage';
import { Badge, Button, Card, FadeIn, GradientCard, Header, Icon, ListRow, Screen, Section, Skeleton, StatTile, T } from '../../ui/components';
import { AreaChart, Donut } from '../../ui/charts';
import { space, useTheme } from '../../ui/theme';

type Insights = Awaited<ReturnType<typeof aiService.insights>>;

const LEVEL_COLOR = { LOW: '#2E8B57', MEDIUM: '#CA8A04', HIGH: '#EA580C', CRITICAL: '#DC2626' } as const;

export default function InsightsScreen() {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const { c } = useTheme();
  const [data, setData] = useState<Insights | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await aiService.insights();
      setData(d);
      cacheStorage.save('ai-insights', d).catch(() => undefined);
    } catch {
      const cached = await cacheStorage.get('ai-insights');
      if (cached) setData(cached as Insights);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const levels = (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((l) => ({
    label: l.charAt(0) + l.slice(1).toLowerCase(),
    value: data?.risks.filter((r) => r.expiryRiskLevel === l).length ?? 0,
    color: LEVEL_COLOR[l],
  }));

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
      }}
    >
      <Header title="AI Insights" subtitle={data?.aiProvider ?? 'Analysing your stock…'} onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} />

      {!data ? (
        <>
          <Skeleton height={150} />
          <Skeleton height={200} style={{ marginTop: space.lg }} />
        </>
      ) : (
        <>
          <FadeIn>
            <GradientCard>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="creation" size={20} color="#FFF" />
                <T variant="title" color="#FFF">
                  AI summary
                </T>
              </View>
              {data.narrative
                .split('\n')
                .filter(Boolean)
                .map((l, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#A7F3D0', marginTop: 8 }} />
                    <T color="#FFF" style={{ flex: 1, lineHeight: 22 }}>
                      {l.replace(/^[-•*]\s*/, '')}
                    </T>
                  </View>
                ))}
            </GradientCard>
          </FadeIn>

          <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.lg }}>
            <StatTile label="High expiry risk" value={data.counts.highExpiryRisk} icon="calendar-alert" tone="warning" hint={`~${data.counts.unitsAtRisk} units at risk`} />
            <StatTile label="High recall risk" value={data.counts.highRecallRisk} icon="shield-alert-outline" tone="danger" />
          </View>

          <Section title="Demand forecast">
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <T variant="small" muted>
                  Units moved · next 3 months dashed
                </T>
                <Badge label={data.forecast.trend} tone={data.forecast.trend === 'DECREASING' ? 'warning' : 'success'} size="sm" />
              </View>
              <AreaChart
                width={width - space.lg * 4}
                height={170}
                forecastFrom={data.forecast.history.length}
                data={[
                  ...data.forecast.history.map((h) => ({ label: h.month.split(' ')[0], value: h.units })),
                  ...data.forecast.forecast.map((f) => ({ label: f.month.split(' ')[0], value: f.units })),
                ]}
              />
            </Card>
          </Section>

          <Section title="Expiry risk mix">
            <Card>
              <Donut segments={levels} centerLabel="BATCHES" />
            </Card>
          </Section>

          <Section title="Recommendations">
            <Card padded={false} style={{ paddingHorizontal: space.lg }}>
              {data.recommendations.map((r, i) => (
                <ListRow
                  key={i}
                  icon={r.priority === 'CRITICAL' || r.priority === 'HIGH' ? 'alert-circle-outline' : 'lightbulb-on-outline'}
                  iconTone={r.priority === 'CRITICAL' || r.priority === 'HIGH' ? 'danger' : r.priority === 'MEDIUM' ? 'warning' : 'success'}
                  title={r.title}
                  subtitle={r.detail}
                  last={i === data.recommendations.length - 1}
                />
              ))}
            </Card>
          </Section>

          <Section title="Riskiest batches">
            <Card padded={false} style={{ paddingHorizontal: space.lg }}>
              {data.risks.slice(0, 8).map((r, i) => (
                <ListRow
                  key={r.batchId}
                  icon="pill"
                  iconTone="primary"
                  title={r.drugName}
                  subtitle={`${r.batchNumber} · ${r.unitsInStock} units · ${r.daysToExpiry <= 0 ? 'expired' : `${r.daysToExpiry}d left`}`}
                  right={<Badge status={r.expiryRiskLevel} size="sm" />}
                  last={i === Math.min(7, data.risks.length - 1)}
                />
              ))}
              {data.risks.length === 0 && <T muted style={{ paddingVertical: space.lg }}>No batches to analyse yet.</T>}
            </Card>
          </Section>

          <Button title="Ask the AI assistant" icon="robot-happy-outline" onPress={() => navigation.navigate('Assistant')} style={{ marginTop: space.xl }} />
          <View style={{ height: 1, backgroundColor: c.bg }} />
        </>
      )}
    </Screen>
  );
}

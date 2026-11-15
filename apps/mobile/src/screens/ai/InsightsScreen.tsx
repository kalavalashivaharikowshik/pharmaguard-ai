import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { aiService } from '../../services/aiService';
import { cacheStorage } from '../../storage/cacheStorage';
import { COLORS } from '../../utils/theme';

type Insights = Awaited<ReturnType<typeof aiService.insights>>;

const LEVEL_COLOR: Record<string, string> = { LOW: COLORS.success, MEDIUM: '#CA8A04', HIGH: '#EA580C', CRITICAL: COLORS.danger };

/** AI insights for organisation roles (oversight roles see the full analytics dashboard). */
export default function InsightsScreen() {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await aiService.insights();
      setData(d);
      await cacheStorage.save('ai-insights', d);
    } catch {
      const cached = await cacheStorage.get('ai-insights');
      if (cached) setData(cached as Insights);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const max = Math.max(1, ...(data?.forecast.history ?? []).map((h) => h.units), ...(data?.forecast.forecast ?? []).map((f) => f.units));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>AI Insights</Text>
          <Text style={styles.heroSub}>{data?.aiProvider ?? 'Analysing your stock…'}</Text>
        </View>

        {data && (
          <>
            <View style={styles.grid}>
              {[
                ['High expiry risk', data.counts.highExpiryRisk, '#EA580C'],
                ['High recall risk', data.counts.highRecallRisk, COLORS.danger],
                ['Low stock', data.counts.lowStock, '#CA8A04'],
                ['Units at risk', data.counts.unitsAtRisk, COLORS.primary],
              ].map(([label, value, color]) => (
                <View key={label as string} style={styles.stat}>
                  <Text style={[styles.statValue, { color: color as string }]}>{value as number}</Text>
                  <Text style={styles.statLabel}>{label as string}</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Summary</Text>
              {data.narrative
                .split('\n')
                .filter(Boolean)
                .map((l, i) => (
                  <Text key={i} style={styles.body}>
                    • {l.replace(/^[-•*]\s*/, '')}
                  </Text>
                ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Demand forecast ({data.forecast.trend.toLowerCase()})</Text>
              <View style={styles.chart}>
                {[...data.forecast.history.map((h) => ({ ...h, f: false })), ...data.forecast.forecast.map((f) => ({ ...f, f: true }))].map((p) => (
                  <View key={p.month + p.f} style={styles.barCol}>
                    <View style={[styles.bar, { height: Math.max(4, (p.units / max) * 110), backgroundColor: p.f ? COLORS.success : COLORS.primary, opacity: p.f ? 0.6 : 1 }]} />
                    <Text style={styles.barLabel}>{p.month.split(' ')[0]}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.meta}>Green bars are the 3-month forecast.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Recommendations</Text>
              {data.recommendations.map((r, i) => (
                <View key={i} style={styles.rec}>
                  <View style={[styles.dot, { backgroundColor: LEVEL_COLOR[r.priority] ?? COLORS.primary }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recTitle}>{r.title}</Text>
                    <Text style={styles.meta}>{r.detail}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Riskiest batches</Text>
              {data.risks.slice(0, 8).map((r) => (
                <View key={r.batchId} style={styles.riskRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recTitle}>{r.drugName}</Text>
                    <Text style={styles.meta}>
                      {r.batchNumber} · {r.unitsInStock} units · {r.daysToExpiry <= 0 ? 'expired' : `${r.daysToExpiry}d left`}
                    </Text>
                  </View>
                  <Text style={[styles.badge, { color: LEVEL_COLOR[r.expiryRiskLevel] }]}>{r.expiryRiskLevel}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('Assistant')}>
              <MaterialIcons name="smart-toy" size={20} color={COLORS.white} />
              <Text style={styles.ctaText}>Ask the AI assistant</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 20 },
  heroTitle: { color: COLORS.white, fontSize: 24, fontWeight: '800' },
  heroSub: { color: '#D6E6F4', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: { width: '48%', backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 14 },
  statValue: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 13, color: COLORS.subtitle, marginTop: 2 },
  card: { backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 16, gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  body: { fontSize: 14, color: COLORS.text, lineHeight: 21 },
  meta: { fontSize: 12, color: COLORS.subtitle, lineHeight: 17 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 130, marginTop: 6 },
  barCol: { alignItems: 'center', flex: 1 },
  bar: { width: 16, borderRadius: 4 },
  barLabel: { fontSize: 10, color: COLORS.subtitle, marginTop: 4 },
  rec: { flexDirection: 'row', gap: 10, paddingVertical: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  recTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  riskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.border },
  badge: { fontSize: 12, fontWeight: '800' },
  cta: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14 },
  ctaText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});

import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { recallService } from '../../services/recallService';
import { aiService } from '../../services/aiService';
import { Badge, Card, GradientCard, Header, Icon, KeyValue, ListRow, ProgressBar, Screen, Skeleton, T } from '../../ui/components';
import { space, useTheme } from '../../ui/theme';
import { countdown, fmtDate, fmtDateTime, ROLE_LABEL } from '../../ui/format';

export default function RecallDetailScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { c } = useTheme();
  const [recall, setRecall] = useState<any>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [impact, setImpact] = useState<Awaited<ReturnType<typeof aiService.recallImpact>> | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [r] = await Promise.all([
      recallService.getRecall(params.id),
      aiService.recallSummary(params.id).then((s) => setSummary(s.summary)).catch(() => undefined),
      aiService.recallImpact(params.id).then(setImpact).catch(() => undefined),
    ]);
    setRecall(r);
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!recall) {
    return (
      <Screen>
        <Header title="Recall" onBack={() => navigation.goBack()} />
        <Skeleton height={170} />
        <Skeleton height={140} style={{ marginTop: space.lg }} />
      </Screen>
    );
  }

  const active = recall.status === 'ACTIVE';

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
      }}
    >
      <Header title={recall.recallNumber} onBack={() => navigation.goBack()} right={<Badge status={active ? recall.severity : 'COMPLETED'} />} />

      <GradientCard colors={active ? ['#7F1D1D', '#B91C1C', '#DC2626'] : undefined}>
        <T variant="tiny" color="rgba(255,255,255,0.8)">
          {active ? `${recall.severity} RECALL · ACTIVE` : 'RECALL COMPLETED'}
        </T>
        <T variant="h2" color="#FFF" style={{ marginTop: 6 }}>
          {recall.batch?.drugName}
        </T>
        <T color="rgba(255,255,255,0.85)">{recall.batch?.batchNumber}</T>
        <T color="#FFF" style={{ marginTop: space.md }}>
          {recall.reason}
        </T>
        {active && impact?.dueDate && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.md }}>
            <Icon name="timer-outline" size={18} color="#FFF" />
            <T variant="bodyStrong" color="#FFF">
              {countdown(impact.dueDate)}
            </T>
          </View>
        )}
      </GradientCard>

      <Card style={{ marginTop: space.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Icon name="creation" color={c.primary} />
          <T variant="title">AI summary</T>
        </View>
        {summary ? <T style={{ lineHeight: 22 }}>{summary}</T> : <Skeleton height={60} />}
      </Card>

      {impact && (
        <Card style={{ marginTop: space.md }}>
          <T variant="title">Progress</T>
          <View style={{ flexDirection: 'row', marginVertical: space.md }}>
            {[
              ['Organisations', impact.affectedOrganizations],
              ['Units', impact.affectedUnits],
              ['Overdue', impact.tasks.overdue],
            ].map(([l, v]) => (
              <View key={l as string} style={{ flex: 1 }}>
                <T variant="h2">{v as number}</T>
                <T variant="tiny" muted>
                  {(l as string).toUpperCase()}
                </T>
              </View>
            ))}
          </View>
          <ProgressBar value={impact.progress} tone={impact.progress === 100 ? 'success' : 'warning'} />
          <T variant="small" muted style={{ marginTop: 6 }}>
            {impact.tasks.completed} of {impact.tasks.total} holders have quarantined their stock
          </T>
          {impact.locations.length > 0 && (
            <View style={{ marginTop: space.md }}>
              {impact.locations.map((l, i) => (
                <ListRow
                  key={l.userId}
                  icon={l.role === 'PHARMACY' ? 'storefront-outline' : l.role === 'HOSPITAL' ? 'hospital-building' : l.role === 'DISTRIBUTOR' ? 'truck-outline' : 'factory'}
                  iconTone={l.taskStatus === 'COMPLETED' ? 'success' : l.taskStatus === 'OVERDUE' ? 'danger' : 'warning'}
                  title={l.organization ?? 'Organisation'}
                  subtitle={`${ROLE_LABEL[l.role ?? ''] ?? ''}${l.city ? ` · ${l.city}` : ''} · ${l.quantity} units`}
                  right={<Badge status={l.taskStatus === 'NO_TASK' ? 'PENDING' : l.taskStatus} size="sm" />}
                  last={i === impact.locations.length - 1}
                />
              ))}
            </View>
          )}
        </Card>
      )}

      <Card style={{ marginTop: space.md }}>
        <T variant="title" style={{ marginBottom: 4 }}>
          Details
        </T>
        <KeyValue label="Manufacturer" value={recall.batch?.manufacturer?.name} />
        <KeyValue label="Batch expiry" value={fmtDate(recall.batch?.expiryDate)} />
        <KeyValue label="Started" value={fmtDateTime(recall.createdAt)} />
        {recall.completedAt ? <KeyValue label="Completed" value={fmtDateTime(recall.completedAt)} /> : null}
      </Card>
    </Screen>
  );
}

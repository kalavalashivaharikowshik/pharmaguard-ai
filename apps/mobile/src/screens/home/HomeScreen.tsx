import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';
import { aiService } from '../../services/aiService';
import {
  Avatar,
  Badge,
  Card,
  Empty,
  FadeIn,
  GradientCard,
  Icon,
  IconButton,
  type IconName,
  ListRow,
  Screen,
  Section,
  Skeleton,
  StatTile,
  T,
  haptic,
} from '../../ui/components';
import { AreaChart } from '../../ui/charts';
import { brand, radius, space, useTheme } from '../../ui/theme';
import { can, countdown, greeting, ROLE_LABEL, timeAgo } from '../../ui/format';

type Insights = Awaited<ReturnType<typeof aiService.insights>>;
type Task = Awaited<ReturnType<typeof aiService.myTasks>>[number];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const { summary, recalls, transfers, notifications, loading, refresh } = useDashboard();
  const [insights, setInsights] = useState<Insights | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadExtras = useCallback(() => {
    aiService.insights().then(setInsights).catch(() => undefined);
    aiService
      .myTasks()
      .then((t) => setTasks(t.filter((x) => x.status !== 'COMPLETED')))
      .catch(() => undefined);
  }, []);

  useEffect(loadExtras, [loadExtras]);
  useFocusEffect(useCallback(() => void aiService.myTasks().then((t) => setTasks(t.filter((x) => x.status !== 'COMPLETED'))).catch(() => undefined), []));

  const onRefresh = () => {
    refresh();
    loadExtras();
  };

  const unread = notifications.filter((n) => !n.isRead).length;
  const role = user?.role;

  const actions: { label: string; icon: IconName; onPress: () => void; tone: string }[] = [
    { label: 'Scan', icon: 'qrcode-scan', tone: brand.blue, onPress: () => navigation.navigate('Scan') },
    ...(can.transfer(role) ? [{ label: 'Transfer', icon: 'truck-fast-outline' as IconName, tone: '#7C3AED', onPress: () => navigation.navigate('CreateTransfer') }] : []),
    { label: 'AI Insights', icon: 'chart-timeline-variant-shimmer', tone: brand.green, onPress: () => navigation.navigate('Insights') },
    { label: 'Assistant', icon: 'robot-happy-outline', tone: '#0891B2', onPress: () => navigation.navigate('Assistant') },
    ...(!can.transfer(role) ? [{ label: 'History', icon: 'history' as IconName, tone: '#EA580C', onPress: () => navigation.navigate('ScanHistory') }] : []),
  ];

  const chartData = insights
    ? [
        ...insights.forecast.history.map((h) => ({ label: h.month.split(' ')[0], value: h.units })),
        ...insights.forecast.forecast.map((f) => ({ label: f.month.split(' ')[0], value: f.units })),
      ]
    : [];

  return (
    <Screen refreshing={loading} onRefresh={onRefresh}>
      {/* Top bar */}
      <View style={styles.top}>
        <Pressable onPress={() => navigation.navigate('Profile')} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          <Avatar name={user?.fullName} />
          <View style={{ flex: 1 }}>
            <T variant="small" muted>
              {greeting()} 👋
            </T>
            <T variant="title" numberOfLines={1}>
              {user?.fullName ?? 'PharmaGuard'}
            </T>
          </View>
        </Pressable>
        <IconButton icon="bell-outline" label="Notifications" badge={unread} onPress={() => navigation.navigate('Notifications')} />
      </View>

      {/* Hero */}
      <FadeIn>
        <GradientCard style={{ marginTop: space.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={styles.rolePill}>
              <Icon name="shield-check" size={14} color="#FFFFFF" />
              <T variant="tiny" color="#FFFFFF">
                {ROLE_LABEL[role ?? ''] ?? 'User'} · {user?.organizationName ?? 'PharmaGuard AI'}
              </T>
            </View>
          </View>
          <T variant="small" color="rgba(255,255,255,0.8)" style={{ marginTop: space.lg }}>
            {summary?.scope === 'NETWORK' ? 'Units across the network' : 'Units in your inventory'}
          </T>
          {summary ? (
            <T variant="h1" color="#FFFFFF" style={{ fontSize: 36, marginTop: 2 }}>
              {summary.inventoryUnits.toLocaleString('en-IN')}
            </T>
          ) : (
            <Skeleton height={40} width={160} style={{ marginTop: 6, backgroundColor: 'rgba(255,255,255,0.2)' }} />
          )}
          <View style={styles.heroStats}>
            {[
              ['Active batches', summary?.activeBatches],
              ['Active recalls', summary?.activeRecalls],
              ['Expiring ≤30d', summary?.expiringSoon],
            ].map(([label, value]) => (
              <View key={label as string} style={{ flex: 1 }}>
                <T variant="h3" color="#FFFFFF">
                  {value ?? '–'}
                </T>
                <T variant="tiny" color="rgba(255,255,255,0.75)">
                  {label as string}
                </T>
              </View>
            ))}
          </View>
        </GradientCard>
      </FadeIn>

      {/* Quick actions */}
      <FadeIn delay={80}>
        <View style={styles.actions}>
          {actions.slice(0, 4).map((a) => (
            <Pressable
              key={a.label}
              onPress={() => {
                haptic.tap();
                a.onPress();
              }}
              style={({ pressed }) => [styles.action, pressed && { opacity: 0.7 }]}
            >
              <View style={[styles.actionIcon, { backgroundColor: a.tone + '1A' }]}>
                <Icon name={a.icon} size={26} color={a.tone} />
              </View>
              <T variant="small" style={{ fontWeight: '700' }} center>
                {a.label}
              </T>
            </Pressable>
          ))}
        </View>
      </FadeIn>

      {/* Urgent: recall tasks */}
      {tasks.length > 0 && (
        <FadeIn delay={120}>
          <Card onPress={() => navigation.navigate('Recalls')} style={{ marginTop: space.lg, borderColor: c.danger, backgroundColor: c.dangerSoft }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[styles.urgentIcon, { backgroundColor: c.danger }]}>
                <Icon name="alert-octagon" size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <T variant="title">
                  {tasks.length} recall task{tasks.length > 1 ? 's' : ''} need action
                </T>
                <T variant="small" muted numberOfLines={1}>
                  {tasks[0].recall.batch.drugName} · {countdown(tasks[0].dueDate)}
                </T>
              </View>
              <Icon name="chevron-right" size={24} color={c.danger} />
            </View>
          </Card>
        </FadeIn>
      )}

      {/* Stats */}
      <View style={styles.grid}>
        <StatTile label="Open recall tasks" value={summary?.pendingRecallTasks ?? 0} icon="clipboard-alert-outline" tone="danger" onPress={() => navigation.navigate('Recalls')} />
        <StatTile label="Pending disposals" value={summary?.pendingDisposals ?? 0} icon="delete-sweep-outline" tone="warning" onPress={() => navigation.navigate('Disposals')} />
      </View>

      {/* AI card */}
      <Section title="AI insights" action="See all" onAction={() => navigation.navigate('Insights')}>
        <Card>
          {insights ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <T variant="small" muted>
                  Stock movement · {insights.forecast.trend.toLowerCase()}
                </T>
                <Badge label={insights.aiProvider.startsWith('Google') ? 'Gemini' : 'AI'} tone="primary" icon="creation" size="sm" />
              </View>
              <AreaChart data={chartData} width={width - space.lg * 4} height={140} forecastFrom={insights.forecast.history.length} />
              {insights.recommendations[0] && (
                <View style={[styles.tip, { backgroundColor: c.primarySoft }]}>
                  <Icon name="lightbulb-on-outline" size={20} color={c.primary} />
                  <View style={{ flex: 1 }}>
                    <T variant="bodyStrong">{insights.recommendations[0].title}</T>
                    <T variant="small" muted numberOfLines={2}>
                      {insights.recommendations[0].detail}
                    </T>
                  </View>
                </View>
              )}
            </>
          ) : (
            <>
              <Skeleton height={14} width="50%" />
              <Skeleton height={120} style={{ marginTop: 12 }} />
            </>
          )}
        </Card>
      </Section>

      {/* Recent activity */}
      <Section title="Recent recalls" action="View all" onAction={() => navigation.navigate('Recalls')}>
        <Card padded={false} style={{ paddingHorizontal: space.lg }}>
          {recalls.length === 0 ? (
            <Empty icon="shield-check-outline" title="No recalls" message="Everything in your supply chain is clear." />
          ) : (
            recalls.slice(0, 3).map((r, i) => (
              <ListRow
                key={r.id}
                icon="shield-alert-outline"
                iconTone={r.status === 'ACTIVE' ? 'danger' : 'success'}
                title={r.batch.drugName}
                subtitle={`${r.recallNumber} · ${timeAgo(r.createdAt)}`}
                right={<Badge status={r.status === 'ACTIVE' ? r.severity : 'COMPLETED'} size="sm" />}
                onPress={() => navigation.navigate('RecallDetail', { id: r.id })}
                last={i === Math.min(2, recalls.length - 1)}
              />
            ))
          )}
        </Card>
      </Section>

      {transfers.length > 0 && (
        <Section title="Recent transfers" action="View all" onAction={() => navigation.navigate('Transfers')}>
          <Card padded={false} style={{ paddingHorizontal: space.lg }}>
            {transfers.slice(0, 3).map((t, i) => {
              const incoming = t.toUser?.id === user?.id;
              return (
                <ListRow
                  key={t.id}
                  icon={incoming ? 'arrow-bottom-left' : 'arrow-top-right'}
                  iconTone={incoming ? 'success' : 'primary'}
                  title={`${t.quantity} × ${t.batch.drugName}`}
                  subtitle={`${incoming ? 'From' : 'To'} ${incoming ? t.fromUser?.fullName : t.toUser?.fullName} · ${timeAgo(t.createdAt)}`}
                  onPress={() => navigation.navigate('TransferDetail', { id: t.id, transfer: t })}
                  last={i === Math.min(2, transfers.length - 1)}
                />
              );
            })}
          </Card>
        </Section>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rolePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.16)', paddingVertical: 5, paddingHorizontal: 10, borderRadius: radius.pill },
  heroStats: { flexDirection: 'row', marginTop: space.lg, paddingTop: space.lg, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.18)' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.xl },
  action: { alignItems: 'center', gap: 8, width: '24%' },
  actionIcon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  urgentIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', gap: space.md, marginTop: space.lg },
  tip: { flexDirection: 'row', gap: 10, padding: space.md, borderRadius: radius.md, marginTop: space.sm },
});

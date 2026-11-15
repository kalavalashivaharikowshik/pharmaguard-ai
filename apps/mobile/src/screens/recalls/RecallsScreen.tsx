import { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { recallService } from '../../services/recallService';
import { aiService } from '../../services/aiService';
import { Badge, Button, Card, Chips, Empty, Header, Icon, ListSkeleton, ProgressBar, Screen, T, haptic } from '../../ui/components';
import { radius, space, useTheme } from '../../ui/theme';
import { countdown, errMsg, timeAgo } from '../../ui/format';

type Task = Awaited<ReturnType<typeof aiService.myTasks>>[number];
type Filter = 'ACTIVE' | 'COMPLETED' | 'ALL';

const SEV_ICON: Record<string, any> = { CRITICAL: 'alert-octagon', HIGH: 'alert', MEDIUM: 'alert-circle-outline', LOW: 'information-outline' };

export default function RecallsScreen() {
  const navigation = useNavigation<any>();
  const { c } = useTheme();
  const [recalls, setRecalls] = useState<any[] | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>('ACTIVE');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [r, t] = await Promise.all([recallService.getRecalls(), aiService.myTasks().catch(() => [] as Task[])]);
    setRecalls(r);
    setTasks(t.filter((x) => x.status !== 'COMPLETED'));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const complete = (task: Task) =>
    Alert.alert('Confirm quarantine', `Have all units of ${task.recall.batch.drugName} (${task.recall.batch.batchNumber}) been removed from sale?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, quarantined',
        onPress: async () => {
          try {
            const res = await aiService.completeTask(task.id, 'Quarantined (mobile)');
            haptic.success();
            Toast.show({ type: 'success', text1: res.recallCompleted ? 'Recall closed. Batch revoked on blockchain.' : 'Recall task completed' });
            load();
          } catch (e) {
            Toast.show({ type: 'error', text1: 'Could not complete task', text2: errMsg(e) });
          }
        },
      },
    ]);

  const list = (recalls ?? []).filter((r) => filter === 'ALL' || r.status === filter);

  const header = (
    <View>
      <Header title="Recalls" subtitle="AI agents locate stock, notify holders and track completion" />
      {tasks.length > 0 && (
        <View style={{ marginBottom: space.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: space.md }}>
            <Icon name="clipboard-alert" color={c.danger} />
            <T variant="h3">Action required</T>
            <Badge label={`${tasks.length}`} tone="danger" size="sm" />
          </View>
          {tasks.map((t) => {
            const overdue = t.status === 'OVERDUE' || (t.dueDate && new Date(t.dueDate).getTime() < Date.now());
            return (
              <Card key={t.id} style={{ marginBottom: space.md, borderColor: overdue ? c.danger : c.warning }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={[styles.sevIcon, { backgroundColor: c.dangerSoft }]}>
                    <Icon name={SEV_ICON[t.recall.severity] ?? 'alert'} color={c.danger} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <T variant="title" numberOfLines={1}>
                      {t.recall.batch.drugName}
                    </T>
                    <T variant="small" muted>
                      {t.recall.recallNumber} · {t.recall.batch.batchNumber}
                    </T>
                  </View>
                  <Badge status={t.recall.severity} size="sm" />
                </View>
                <View style={[styles.due, { backgroundColor: overdue ? c.dangerSoft : c.warningSoft }]}>
                  <Icon name="timer-outline" size={18} color={overdue ? c.danger : c.warning} />
                  <T variant="bodyStrong" color={overdue ? c.danger : c.warning}>
                    {countdown(t.dueDate) || 'No deadline'}
                  </T>
                </View>
                <Button title="Mark quarantined" icon="check-decagram" onPress={() => complete(t)} style={{ marginTop: space.md }} />
              </Card>
            );
          })}
        </View>
      )}
      <Chips<Filter>
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'ACTIVE', label: 'Active', count: recalls?.filter((r) => r.status === 'ACTIVE').length },
          { value: 'COMPLETED', label: 'Completed', count: recalls?.filter((r) => r.status === 'COMPLETED').length },
          { value: 'ALL', label: 'All', count: recalls?.length },
        ]}
      />
      <View style={{ height: space.md }} />
    </View>
  );

  return (
    <Screen scroll={false}>
      {!recalls ? (
        <>
          {header}
          <ListSkeleton />
        </>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(r) => r.id}
          ListHeaderComponent={header}
          contentContainerStyle={{ paddingBottom: 130, gap: space.md }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
          ListEmptyComponent={<Empty icon="shield-check-outline" title={filter === 'ACTIVE' ? 'No active recalls' : 'No recalls'} message="Your supply chain is clear." />}
          renderItem={({ item: r }) => {
            const total = r.tasks?.length ?? 0;
            const done = r.tasks?.filter((t: any) => t.status === 'COMPLETED').length ?? 0;
            const active = r.status === 'ACTIVE';
            return (
              <Card onPress={() => navigation.navigate('RecallDetail', { id: r.id })}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={[styles.sevIcon, { backgroundColor: active ? c.dangerSoft : c.successSoft }]}>
                    <Icon name={active ? SEV_ICON[r.severity] ?? 'alert' : 'check-decagram'} color={active ? c.danger : c.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <T variant="title" numberOfLines={1}>
                      {r.batch?.drugName}
                    </T>
                    <T variant="small" muted>
                      {r.recallNumber} · {timeAgo(r.createdAt)}
                    </T>
                  </View>
                  <Badge status={active ? r.severity : 'COMPLETED'} size="sm" />
                </View>
                <T variant="small" muted numberOfLines={2} style={{ marginTop: space.md }}>
                  {r.reason}
                </T>
                {total > 0 && (
                  <View style={{ marginTop: space.md }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <T variant="tiny" muted>
                        HOLDERS DONE
                      </T>
                      <T variant="tiny">
                        {done}/{total}
                      </T>
                    </View>
                    <ProgressBar value={(done / total) * 100} tone={done === total ? 'success' : 'warning'} />
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

const styles = StyleSheet.create({
  sevIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  due: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: space.md, paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.md },
});

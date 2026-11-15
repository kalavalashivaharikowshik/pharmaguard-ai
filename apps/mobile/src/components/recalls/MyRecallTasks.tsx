import { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { aiService } from '../../services/aiService';
import { COLORS } from '../../utils/theme';

type Task = Awaited<ReturnType<typeof aiService.myTasks>>[number];

/** Recall tasks the AI agents assigned to this organisation, with a one-tap "quarantined" action. */
export default function MyRecallTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const load = useCallback(() => {
    aiService
      .myTasks()
      .then((t) => setTasks(t.filter((x) => x.status !== 'COMPLETED')))
      .catch(() => undefined);
  }, []);

  useEffect(load, [load]);

  const complete = (task: Task) => {
    Alert.alert('Confirm quarantine', `Have all units of ${task.recall.batch.batchNumber} been removed from sale?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, quarantined',
        onPress: async () => {
          try {
            const res = await aiService.completeTask(task.id, 'Quarantined (mobile)');
            Toast.show({ type: 'success', text1: res.recallCompleted ? 'Recall closed: batch revoked' : 'Recall task completed' });
            load();
          } catch {
            Toast.show({ type: 'error', text1: 'Could not complete the task' });
          }
        },
      },
    ]);
  };

  if (!tasks.length) return null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <MaterialIcons name="assignment-late" size={20} color={COLORS.danger} />
        <Text style={styles.title}>Action required: {tasks.length} recall task(s)</Text>
      </View>
      {tasks.map((t) => (
        <View key={t.id} style={styles.task}>
          <View style={{ flex: 1 }}>
            <Text style={styles.drug}>
              {t.recall.batch.drugName} · {t.recall.batch.batchNumber}
            </Text>
            <Text style={styles.meta}>
              {t.recall.recallNumber} · {t.status === 'OVERDUE' ? 'OVERDUE' : `due ${t.dueDate ? new Date(t.dueDate).toLocaleString() : '—'}`}
            </Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={() => complete(t)} accessibilityRole="button">
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: '#FECACA', padding: 14, marginHorizontal: 16, marginBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  task: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.border },
  drug: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  meta: { fontSize: 12, color: COLORS.subtitle, marginTop: 2 },
  button: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  buttonText: { color: COLORS.white, fontWeight: '700' },
});

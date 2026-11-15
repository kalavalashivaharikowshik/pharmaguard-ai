import { useCallback, useMemo, useState } from 'react';
import { Pressable, SectionList, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { notificationService } from '../../services/notificationService';
import type { Notification } from '../../types/notification';
import { Chips, Empty, Header, Icon, IconButton, ListSkeleton, Screen, T, haptic, useTone } from '../../ui/components';
import { radius, space, useTheme } from '../../ui/theme';
import { dayGroup, timeAgo } from '../../ui/format';
import { notificationLook } from './notificationLook';

type Filter = 'ALL' | 'UNREAD' | 'URGENT';

function Row({ n, onPress }: { n: Notification; onPress(): void }) {
  const { c } = useTheme();
  const look = notificationLook(n.type, n.priority);
  const t = useTone(look.tone);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { flexDirection: 'row', gap: 12, padding: space.md, borderRadius: radius.md, marginBottom: space.sm, backgroundColor: n.isRead ? c.surface : c.primarySoft, borderWidth: 1, borderColor: c.border },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={{ width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: t.bg }}>
        <Icon name={look.icon} size={21} color={t.fg} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <T variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
            {n.title}
          </T>
          <T variant="tiny" muted>
            {timeAgo(n.createdAt)}
          </T>
        </View>
        <T variant="small" muted numberOfLines={2} style={{ marginTop: 2 }}>
          {n.message}
        </T>
      </View>
      {!n.isRead && <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: c.primary, marginTop: 6 }} />}
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<Notification[] | null>(null);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => setItems(await notificationService.getNotifications()), []);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = (items ?? []).filter((n) => (filter === 'UNREAD' ? !n.isRead : filter === 'URGENT' ? n.priority === 'HIGH' || n.priority === 'CRITICAL' : true));
  const sections = useMemo(() => {
    const map = new Map<string, Notification[]>();
    for (const n of filtered) map.set(dayGroup(n.createdAt), [...(map.get(dayGroup(n.createdAt)) ?? []), n]);
    return [...map.entries()].map(([title, data]) => ({ title, data }));
  }, [filtered]);
  const unread = (items ?? []).filter((n) => !n.isRead).length;

  const open = async (n: Notification) => {
    haptic.tap();
    navigation.navigate('NotificationDetail', { id: n.id, notification: n });
    if (!n.isRead) notificationService.markAsRead(n.id).catch(() => undefined);
  };

  return (
    <Screen scroll={false}>
      <Header
        title="Notifications"
        subtitle={unread ? `${unread} unread` : 'All caught up'}
        onBack={() => navigation.goBack()}
        right={
          unread ? (
            <IconButton
              icon="check-all"
              label="Mark all read"
              onPress={async () => {
                await notificationService.markAllAsRead().catch(() => undefined);
                Toast.show({ type: 'success', text1: 'All marked as read' });
                load();
              }}
            />
          ) : undefined
        }
      />
      <Chips<Filter>
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'ALL', label: 'All', count: items?.length },
          { value: 'UNREAD', label: 'Unread', count: unread },
          { value: 'URGENT', label: 'Urgent', count: items?.filter((n) => n.priority === 'HIGH' || n.priority === 'CRITICAL').length },
        ]}
      />
      {!items ? (
        <View style={{ marginTop: space.lg }}>
          <ListSkeleton />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(n) => n.id}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingTop: space.sm, paddingBottom: 60 }}
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
          ListEmptyComponent={<Empty icon="bell-check-outline" title="You're all caught up" message="New alerts about recalls, transfers and expiry show up here." />}
          renderSectionHeader={({ section }) => (
            <T variant="tiny" muted style={{ marginTop: space.md, marginBottom: space.sm }}>
              {section.title.toUpperCase()}
            </T>
          )}
          renderItem={({ item }) => <Row n={item} onPress={() => open(item)} />}
        />
      )}
    </Screen>
  );
}

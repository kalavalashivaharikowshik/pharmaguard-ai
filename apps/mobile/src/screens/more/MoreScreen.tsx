import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import { Avatar, Badge, Card, Icon, type IconName, ListRow, Screen, T, type Tone } from '../../ui/components';
import { space, useTheme } from '../../ui/theme';
import { can, ROLE_LABEL } from '../../ui/format';

export default function MoreScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { c } = useTheme();
  const role = user?.role;

  const groups: { title: string; items: { icon: IconName; tone: Tone; title: string; subtitle: string; to?: string; onPress?: () => void; hidden?: boolean }[] }[] = [
    {
      title: 'Supply chain',
      items: [
        { icon: 'truck-fast-outline', tone: 'primary', title: 'Transfers', subtitle: 'Sent and received batches', to: 'Transfers' },
        { icon: 'delete-sweep-outline', tone: 'warning', title: 'Disposal & returns', subtitle: 'Remove unsafe stock with evidence', to: 'Disposals' },
        { icon: 'history', tone: 'info', title: 'Scan history', subtitle: 'Every medicine you verified', to: 'ScanHistory' },
      ],
    },
    {
      title: 'Intelligence',
      items: [
        { icon: 'chart-timeline-variant-shimmer', tone: 'success', title: 'AI Insights', subtitle: 'Risk scores, forecast, recommendations', to: 'Insights' },
        { icon: 'robot-happy-outline', tone: 'primary', title: 'AI Assistant', subtitle: 'Ask about your stock in plain language', to: 'Assistant' },
        { icon: 'chart-box-outline', tone: 'info', title: 'Network analytics', subtitle: 'Trends across all organisations', to: 'Analytics', hidden: !can.oversight(role) },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: 'bell-outline', tone: 'primary', title: 'Notifications', subtitle: 'Alerts and updates', to: 'Notifications' },
        { icon: 'account-circle-outline', tone: 'primary', title: 'Profile', subtitle: 'Your details and organisation', to: 'Profile' },
        { icon: 'cog-outline', tone: 'neutral', title: 'Settings', subtitle: 'Theme, fingerprint login, alerts', to: 'Settings' },
        { icon: 'logout', tone: 'danger', title: 'Log out', subtitle: 'Sign out of this device', onPress: logout },
      ],
    },
  ];

  return (
    <Screen>
      <T variant="h1" style={{ marginBottom: space.lg }}>
        More
      </T>
      <Card onPress={() => navigation.navigate('Profile')} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Avatar name={user?.fullName} size={56} />
        <View style={{ flex: 1 }}>
          <T variant="h3" numberOfLines={1}>
            {user?.fullName}
          </T>
          <T variant="small" muted numberOfLines={1}>
            {user?.email}
          </T>
          <View style={{ marginTop: 6 }}>
            <Badge label={ROLE_LABEL[role ?? ''] ?? role} tone="primary" icon="shield-account" size="sm" />
          </View>
        </View>
        <Icon name="chevron-right" color={c.textSoft} />
      </Card>

      {groups.map((g) => {
        const items = g.items.filter((i) => !i.hidden);
        return (
          <View key={g.title} style={{ marginTop: space.xl }}>
            <T variant="tiny" muted style={{ marginBottom: space.sm, marginLeft: 4 }}>
              {g.title.toUpperCase()}
            </T>
            <Card padded={false} style={{ paddingHorizontal: space.lg }}>
              {items.map((i, idx) => (
                <ListRow
                  key={i.title}
                  icon={i.icon}
                  iconTone={i.tone}
                  title={i.title}
                  subtitle={i.subtitle}
                  onPress={i.onPress ?? (() => navigation.navigate(i.to!))}
                  last={idx === items.length - 1}
                />
              ))}
            </Card>
          </View>
        );
      })}
      <T variant="tiny" muted center style={{ marginTop: space.xl }}>
        PharmaGuard AI · v1.0.0
      </T>
    </Screen>
  );
}

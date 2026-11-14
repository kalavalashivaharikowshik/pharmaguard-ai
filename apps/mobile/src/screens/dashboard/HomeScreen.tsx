import {
  ScrollView,
  RefreshControl,
  View,
  StyleSheet,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import { useDashboard } from '../../hooks/useDashboard';

import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatCard from '../../components/dashboard/StatCard';
import QuickAction from '../../components/dashboard/QuickAction';

import SectionTitle from '../../components/common/SectionTitle';

import NotificationPreview from '../../components/dashboard/NotificationPreview';
import TransferPreview from '../../components/dashboard/TransferPreview';
import RecallPreview from '../../components/dashboard/RecallPreview';

import { COLORS } from '../../utils/theme';

export default function HomeScreen() {

  const navigation =
    useNavigation<any>();

  const {
    user,
  } = useAuth();

  const{
    summary,
    notifications,
    transfers,
    recalls,
    loading,
    refresh,
    }=useDashboard();

  return (

    <SafeAreaView style={styles.container}>

      <ScrollView

        contentContainerStyle={styles.scrollContent}

        showsVerticalScrollIndicator={false}

        refreshControl={

          <RefreshControl

            refreshing={loading}

            onRefresh={refresh}

            colors={[COLORS.primary]}

            tintColor={COLORS.primary}

          />

        }

      >

        <DashboardHeader

          name={user?.fullName ?? ''}

          role={user?.role ?? ''}

        />

        <View style={styles.content}>

          {/* KPI Cards */}

          <View
            style={styles.row}
          >

            <StatCard
              title="Inventory"
              value={
                summary?.inventoryUnits ?? 0
              }
              icon="inventory"
              color={COLORS.information}
              suffix="Units"
            />

            <StatCard
              title="Recalls"
              value={
                summary?.activeRecalls ?? 0
              }
              icon="warning"
              color={COLORS.warning}
            />

          </View>

          <View style={styles.row}>

            <StatCard
              title="Batches"
              value={
                summary?.activeBatches ?? 0
              }
              icon="medication"
              color={COLORS.success}
            />

            <StatCard
              title="Notifications"
              value={
                summary?.notifications ?? 0
              }
              icon="notifications"
              color={COLORS.danger}
            />

          </View>

          {/* Quick Actions */}

          <SectionTitle
            title="Quick Actions"
          />

          <View
            style={styles.quickActions}
          >

            <QuickAction
              title="Scan QR"
              icon="qr-code-scanner"
              color={COLORS.primary}
              onPress={() =>
                navigation.navigate(
                    'Main',
                    {
                    screen: 'Scanner',
                    },
                )
                }
            />

            <QuickAction
              title="Inventory"
              icon="inventory"
              color={COLORS.information}
              onPress={() =>
                navigation.navigate(
                    'Main',
                    {
                    screen: 'Inventory',
                    },
                )
              }
            />

            <QuickAction
              title="Transfers"
              icon="local-shipping"
              color="#7C3AED"
              onPress={() =>
                navigation.navigate(
                    'Main',
                    {
                    screen: 'Transfers',
                    },
                )
                }
            />

            <QuickAction
              title="Notifications"
              icon="notifications"
              color={COLORS.danger}
              onPress={() =>
                navigation.navigate(
                    'Notifications',
                )
                }
            />

            <QuickAction
              title="Profile"
              icon="person"
              color={COLORS.success}
              onPress={() =>
                navigation.navigate(
                  'Profile',
                )
              }
            />

            <QuickAction
              title="Verify"
              icon="verified"
              color="#0891B2"
              onPress={() => {
                // Will connect during Blockchain Verification phase
              }}
            />

            <QuickAction
            title="Recalls"
            icon="warning"
            color={COLORS.warning}
            onPress={() =>
                navigation.navigate(
                'Main',
                {
                    screen: 'Recalls',
                },
                )
            }
            />
          </View>

          {/* Recent Notifications */}

          <SectionTitle
            title="Recent Notifications"
            action="View All"
            onPress={() =>
                navigation.navigate(
                'Notifications',
                )
            }
            />

            <NotificationPreview
            notifications={notifications.slice(0, 3)}
            />

            <SectionTitle
                title="Recent Transfers"
                action="View All"
                onPress={() =>
                    navigation.navigate(
                        'Main',
                        {
                            screen: 'Transfers',
                        },
                    )
                }
                />

                <TransferPreview
                transfers={transfers.slice(0, 3)}
                />
            <SectionTitle
                title="Recent Recalls"
                action="View All"
                onPress={() =>
                    navigation.navigate(
                        'Main',
                        {
                            screen: 'Recalls',
                        },
                    )
                }
                />

                <RecallPreview
                recalls={recalls.slice(0, 3)}
                />
        </View>

      </ScrollView>

    </SafeAreaView>

  );

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingBottom: 30,
  },

  content: {
    padding: 18,
  },

  row: {
    flexDirection: 'row',
  },

  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
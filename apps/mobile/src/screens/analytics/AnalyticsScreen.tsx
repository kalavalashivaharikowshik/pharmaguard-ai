import {
  ScrollView,
  View,
  RefreshControl,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import PageHeader from '../../components/common/PageHeader';
import LoadingScreen from '../../components/common/LoadingScreen';

import ManufacturerStatistics from '../../components/analytics/ManufacturerStatistics';
import AnalyticsSummaryCard from '../../components/analytics/AnalyticsSummaryCard';
import AnalyticsBarChart from '../../components/analytics/AnalyticsBarChart';
import AnalyticsPieChart from '../../components/analytics/AnalyticsPieChart';


import { useAnalytics } from '../../hooks/useAnalytics';
import { useAuth } from '../../context/AuthContext';
import InsightsScreen from '../ai/InsightsScreen';

import { COLORS } from '../../utils/theme';

function NetworkAnalyticsScreen() {

  const {

    analytics,

    loading,

    refresh,

  } = useAnalytics();

  if (

    loading ||

    !analytics

  ) {

    return (

      <LoadingScreen

        title="Loading Analytics"

        subtitle="Preparing enterprise dashboard."

      />

    );

  }

  return (

    <SafeAreaView

      style={{

        flex: 1,

        backgroundColor: COLORS.background,

      }}

    >

      <ScrollView

        refreshControl={

          <RefreshControl

            refreshing={loading}

            onRefresh={refresh}

          />

        }

        showsVerticalScrollIndicator={false}

        contentContainerStyle={{

          padding:20,

          paddingBottom:40,

        }}

      >

        <PageHeader

          title="Analytics"

          subtitle="Enterprise business insights"

        />

        <View

          style={{

            flexDirection:'row',

            flexWrap:'wrap',

            justifyContent:'space-between',

          }}

        >

          <AnalyticsSummaryCard

            title="Inventory"

            value={analytics.summary.inventory}

            icon="inventory"

            color={COLORS.primary}

          />

          <AnalyticsSummaryCard

            title="Transfers"

            value={analytics.summary.transfers}

            icon="local-shipping"

            color="#7C3AED"

          />

          <AnalyticsSummaryCard

            title="Recalls"

            value={analytics.summary.recalls}

            icon="warning"

            color={COLORS.warning}

          />

          <AnalyticsSummaryCard

            title="Manufacturers"

            value={analytics.summary.manufacturers}

            icon="business"

            color={COLORS.success}

          />

          <AnalyticsSummaryCard

            title="Active Batches"

            value={analytics.summary.activeBatches}

            icon="verified"

            color="#0891B2"

          />

          <AnalyticsSummaryCard

            title="Revoked"

            value={analytics.summary.revokedBatches}

            icon="block"

            color={COLORS.danger}

          />

        </View>

        <AnalyticsBarChart

          title="Monthly Inventory"

          color={COLORS.primary}

          data={

            analytics.inventoryTrend.map(

              item => ({

                month:item.month,

                value:item.quantity,

              }),

            )

          }

        />

        <AnalyticsBarChart

          title="Monthly Transfers"

          color="#7C3AED"

          data={

            analytics.transferTrend.map(

              item => ({

                month:item.month,

                value:item.transfers,

              }),

            )

          }

        />

        <AnalyticsBarChart

          title="Monthly Recalls"

          color={COLORS.warning}

          data={

            analytics.recallTrend.map(

              item => ({

                month:item.month,

                value:item.recalls,

              }),

            )

          }

        />

        <AnalyticsPieChart

          title="Recall Severity"

          data={

            analytics.recallDistribution

          }

        />

        <ManufacturerStatistics

          data={analytics.manufacturerStats}

        />

      </ScrollView>

    </SafeAreaView>

  );

}

/** Oversight roles get network analytics; other roles get their AI insights. */
export default function AnalyticsScreen() {
  const { user } = useAuth();
  if (user?.role === 'SUPER_ADMIN' || user?.role === 'REGULATOR') {
    return <NetworkAnalyticsScreen />;
  }
  return <InsightsScreen />;
}

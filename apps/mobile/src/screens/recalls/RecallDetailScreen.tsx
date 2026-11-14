import {
  ScrollView,
  View,
  Text,
  RefreshControl,
  StyleSheet,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import Toast from 'react-native-toast-message';

import SeverityBadge from '../../components/recalls/SeverityBadge';
import RecallStatusBadge from '../../components/recalls/RecallStatusBadge';

import { recallService } from '../../services/recallService';

import LoadingScreen from '../../components/common/LoadingScreen';
import PageHeader from '../../components/common/PageHeader';

import { COLORS } from '../../utils/theme';

import type { Recall } from '../../types/recall';

export default function RecallDetailScreen() {

  const route = useRoute<any>();
  const navigation =
  useNavigation<any>();

  const { id } = route.params;

  const [
    recall,
    setRecall,
  ] = useState<Recall | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const loadRecall = useCallback(async () => {

    try {

      const data =
        await recallService.getRecall(id);

      setRecall(data);

    }

    catch {

      Toast.show({

        type: 'error',

        text1: 'Unable to load recall',

      });

    }

    finally {

      setLoading(false);

    }

  }, [id]);

  useEffect(() => {

    loadRecall();

  }, [loadRecall]);

  const refresh = useCallback(async () => {

    setRefreshing(true);

    await loadRecall();

    setRefreshing(false);

  }, [loadRecall]);

  const banner = useMemo(() => {

  if (!recall) {

    return {

      color: COLORS.success,

      title: '',

      message: '',

    };

  }

  return recall.status === 'ACTIVE'

    ? {

        color: COLORS.danger,

        title: '🚨 ACTIVE RECALL',

        message:
          'Immediate action is required for this recalled batch.',

      }

    : {

        color: COLORS.success,

        title: '✅ RECALL COMPLETED',

        message:
          'This recall has been completed successfully.',

      };

}, [recall]);

  if (loading) {

    return (

      <LoadingScreen
        title="Loading Recall"
        subtitle="Retrieving recall information."
      />

    );

  }

  if (!recall) {

    return null;

  }

  return (

    <SafeAreaView style={styles.container}>

      <ScrollView
      showsVerticalScrollIndicator={false}

        refreshControl={

          <RefreshControl

            refreshing={refreshing}

            onRefresh={refresh}

          />

        }

        contentContainerStyle={styles.content}

      >

        <PageHeader

          title="Recall Details"

          subtitle="View complete recall information"
        onBack={() => navigation.goBack()}

        />

        <View style={styles.iconContainer}>

          <View style={styles.iconCircle}>

            <MaterialIcons

              name="health-and-safety"

              size={46}

              color={COLORS.danger}

            />

          </View>

        </View>

        <View

          style={[

            styles.banner,

            {

              backgroundColor: banner.color,

            },

          ]}

        >

          <Text style={styles.bannerTitle}>

            {banner.title}

          </Text>

          <Text style={styles.bannerMessage}>

            {banner.message}

          </Text>

        </View>

        <View style={styles.card}>

          <Text style={styles.title}>

            {recall.batch.drugName}

          </Text>

          <Text style={styles.subtitle}>

            Medicine Information

          </Text>

          <View style={styles.row}>

            <View style={styles.column}>

              <Text style={styles.infoLabel}>

                Batch Number

              </Text>

              <Text style={styles.infoValue}>

                {recall.batch.batchNumber}

              </Text>

            </View>

            <View style={styles.column}>

              <Text style={styles.infoLabel}>

                Manufacturer

              </Text>

              <Text style={styles.infoValue}>

                {recall.batch.manufacturer?.name ?? 'N/A'}

              </Text>

            </View>

          </View>

          <View style={styles.row}>

            <View style={styles.column}>

              <Text style={styles.infoLabel}>

                Batch Status

              </Text>

              <Text style={styles.infoValue}>

                {recall.batch.status}

              </Text>

            </View>

            <View style={styles.column}>

              <Text style={styles.infoLabel}>

                Expiry

              </Text>

              <Text style={styles.infoValue}>

                {new Date(

                  recall.batch.expiryDate,

                ).toLocaleDateString()}

              </Text>

            </View>

          </View>

        </View>

                <View style={styles.card}>

          <Text style={styles.sectionTitle}>
            Recall Information
          </Text>

          <Text style={styles.infoLabel}>
            Recall Number
          </Text>

          <Text style={styles.infoValue}>
            {recall.recallNumber}
          </Text>

          <Text style={[styles.infoLabel, styles.label]}>
            Reason
          </Text>

          <Text style={styles.infoValue}>
            {recall.reason}
          </Text>

          <Text style={[styles.infoLabel, styles.label]}>
            Recall Date
          </Text>

          <Text style={styles.infoValue}>
            {new Date(
              recall.createdAt,
            ).toLocaleDateString()}
          </Text>

          <View style={styles.badgeRow}>

            <SeverityBadge
              severity={recall.severity}
            />

            <RecallStatusBadge
              status={recall.status}
            />

          </View>

        </View>

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>
            AI Impact Summary
          </Text>

          <View style={styles.summaryBox}>

            <Text style={styles.summaryText}>
              {recall.summary ??
                'No AI-generated impact summary is available for this recall.'}
            </Text>

          </View>

        </View>

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>
            Recommended Action
          </Text>

          <View style={styles.recommendationBox}>

            <Text style={styles.recommendationText}>

              • Stop distributing this batch immediately.

              {'\n\n'}

              • Isolate remaining inventory.

              {'\n\n'}

              • Notify affected organizations.

              {'\n\n'}

              • Follow the official recall procedure.

            </Text>

          </View>

        </View>

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>
            Recall Timeline
          </Text>

          <View style={styles.timelineContainer}>

            <Text>
              📅 Recall Created
            </Text>

            <Text style={styles.timelineSpacing}>
              {new Date(
                recall.createdAt,
              ).toLocaleDateString()}
            </Text>

            <Text>
              ⚠ Organizations Notified
            </Text>

            <Text style={styles.timelineSpacing}>
              Completed
            </Text>

            <Text>
              📦 Inventory Quarantined
            </Text>

          </View>

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

  content: {
    padding: 20,
    paddingBottom: 120,
  },

  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },

  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  banner: {
    padding: 22,
    borderRadius: 18,
    marginBottom: 20,
  },

  bannerTitle: {
    color: 'white',
    fontSize: 26,
    fontWeight: '700',
  },

  bannerMessage: {
    color: 'white',
    marginTop: 8,
  },

  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
    elevation: 3,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 15,
  },

  subtitle: {
    color: COLORS.subtitle,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },

  label: {
    marginTop: 15,
  },

  infoLabel: {
    color: COLORS.subtitle,
    fontSize: 13,
  },

  infoValue: {
    fontWeight: '700',
    marginTop: 4,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },

  column: {
    flex: 1,
  },

  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  summaryBox: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    marginTop: 15,
  },

  summaryText: {
    lineHeight: 24,
  },

  recommendationBox: {
    backgroundColor: '#FFF7ED',
    padding: 16,
    borderRadius: 12,
    marginTop: 15,
  },

  recommendationText: {
    lineHeight: 26,
  },

  timelineContainer: {
    marginTop: 15,
  },

  timelineSpacing: {
    marginBottom: 14,
  },

});
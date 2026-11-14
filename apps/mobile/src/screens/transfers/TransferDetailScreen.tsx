import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useMemo,
} from 'react';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  MaterialIcons,
} from '@expo/vector-icons';

import TransferStatusChip from '../../components/transfers/TransferStatusChip';
import TimelineItem from '../../components/transfers/TimelineItem';
import PageHeader from '../../components/common/PageHeader';

import { COLORS } from '../../utils/theme';

export default function TransferDetailScreen() {

  const route =
    useRoute<any>();

  const navigation =
  useNavigation<any>();

  const {
    transfer,
  } = route.params;

  const formattedDate = useMemo(
    () =>
      new Date(
        transfer.createdAt,
      ).toLocaleString(),
    [transfer.createdAt],
  );

  const participants = useMemo(
    () => ({
      sender:
        transfer.fromUser?.fullName ??
        '-',
      receiver:
        transfer.toUser?.fullName ??
        '-',
    }),
    [transfer],
  );

  return (

    <SafeAreaView
      style={styles.container}
    >

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >

        <PageHeader
          title="Transfer Details"
          subtitle="View complete transfer information"
           onBack={() => navigation.goBack()}
        />

        <View
          style={styles.iconContainer}
        >

          <View
            style={styles.iconCircle}
          >

            <MaterialIcons
              name="local-shipping"
              size={46}
              color={COLORS.primary}
            />

          </View>

        </View>

        <View
          style={styles.card}
        >

          <View
            style={styles.headerRow}
          >

            <Text
              style={styles.drugName}
            >
              {transfer.batch.drugName}
            </Text>

            <TransferStatusChip
              status={transfer.status}
            />

          </View>

          <View
            style={styles.row}
          >

            <View
              style={styles.column}
            >

              <Text
                style={styles.label}
              >
                Batch
              </Text>

              <Text
                style={styles.value}
              >
                {transfer.batch.batchNumber}
              </Text>

            </View>

            <View
              style={styles.column}
            >

              <Text
                style={styles.label}
              >
                Quantity
              </Text>

              <Text
                style={styles.value}
              >
                {transfer.quantity} Units
              </Text>

            </View>

          </View>

          <Text
            style={styles.label}
          >
            Transfer Date
          </Text>

          <Text
            style={styles.value}
          >
            {formattedDate}
          </Text>

        </View>

        <View
          style={styles.card}
        >

          <Text
            style={styles.sectionTitle}
          >
            Participants
          </Text>

          <View
            style={styles.participantRow}
          >

            <MaterialIcons
              name="person"
              size={20}
              color={COLORS.primary}
            />

            <View
              style={styles.participantContent}
            >

              <Text
                style={styles.participantLabel}
              >
                Sender
              </Text>

              <Text
                style={styles.participantName}
              >
                {participants.sender}
              </Text>

            </View>

          </View>

          <View
            style={styles.participantRow}
          >

            <MaterialIcons
              name="business"
              size={20}
              color={COLORS.primary}
            />

            <View
              style={styles.participantContent}
            >

              <Text
                style={styles.participantLabel}
              >
                Receiver
              </Text>

              <Text
                style={styles.participantName}
              >
                {participants.receiver}
              </Text>

            </View>

          </View>

        </View>

        <View
          style={styles.timelineCard}
        >

          <Text
            style={styles.sectionTitle}
          >
            Timeline
          </Text>

          <TimelineItem
            title="Transfer Created"
            subtitle={formattedDate}
          />

          <TimelineItem
            title="Transfer Completed"
            subtitle={transfer.status}
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

  content: {
    padding: 20,
  },

  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },

  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
  },

  timelineCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 20,
    elevation: 3,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  drugName: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  column: {
    flex: 1,
  },

  label: {
    color: COLORS.subtitle,
    fontSize: 13,
  },

  value: {
    fontWeight: '700',
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 18,
  },

  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  participantContent: {
    marginLeft: 10,
  },

  participantLabel: {
    color: COLORS.subtitle,
  },

  participantName: {
    fontWeight: '700',
  },

});
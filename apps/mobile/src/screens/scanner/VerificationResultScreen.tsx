import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
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

import type {
  ComponentProps,
} from 'react';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import { COLORS } from '../../utils/theme';

import PageHeader from '../../components/common/PageHeader';

type MaterialIconName =
  ComponentProps<typeof MaterialIcons>['name'];

export default function VerificationResultScreen() {

  const navigation =
    useNavigation<any>();

  const route =
    useRoute<any>();

  const result =
    route.params.result;

  const batch =
    result.batch;

  const state = useMemo(() => {

    if (batch.status === 'REVOKED') {

      return {

        color: COLORS.danger,

        icon: 'cancel' as MaterialIconName,

        text: 'DO NOT DISPENSE',

      };

    }

    if (batch.status === 'RECALLED') {

      return {

        color: COLORS.warning,

        icon: 'warning' as MaterialIconName,

        text: 'RECALLED',

      };

    }

    return {

      color: COLORS.success,

      icon: 'verified' as MaterialIconName,

      text: 'VERIFIED',

    };

  }, [batch.status]);

  return (

    <SafeAreaView style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        <PageHeader
          title="Verification Result"
          subtitle="View blockchain verification details"
          onBack={() => navigation.goBack()}
        />

        <View style={styles.iconContainer}>

          <View style={styles.iconCircle}>

            <MaterialIcons
              name="qr-code-scanner"
              size={46}
              color={COLORS.primary}
            />

          </View>

        </View>

        <View
          style={[
            styles.banner,
            {
              backgroundColor: state.color,
            },
          ]}
        >

          <MaterialIcons
            name={state.icon}
            size={60}
            color="white"
          />

          <Text style={styles.bannerText}>
            {state.text}
          </Text>

        </View>

        <View style={styles.card}>

          <Text style={styles.title}>
            {batch.drugName}
          </Text>

          <Text style={styles.subtitle}>
            Medicine Information
          </Text>

          <View style={styles.row}>

            <View style={styles.column}>

              <Text style={styles.label}>
                Batch
              </Text>

              <Text style={styles.value}>
                {batch.batchNumber}
              </Text>

            </View>

            <View style={styles.column}>

              <Text style={styles.label}>
                Manufacturer
              </Text>

              <Text style={styles.value}>
                {batch.manufacturer?.name ?? 'N/A'}
              </Text>

            </View>

          </View>

          <Text
            style={[
              styles.label,
              {
                marginTop: 16,
              },
            ]}
          >
            Expiry
          </Text>

          <Text style={styles.value}>
            {new Date(batch.expiryDate).toLocaleDateString()}
          </Text>

        </View>

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>
            Blockchain Verification
          </Text>

          <Text style={styles.label}>
            Hash
          </Text>

          <Text
            numberOfLines={2}
            style={styles.value}
          >
            {batch.blockchainHash ?? 'Unavailable'}
          </Text>

          <Text
            style={[
              styles.label,
              {
                marginTop: 15,
              },
            ]}
          >
            Transaction
          </Text>

          <Text
            numberOfLines={2}
            style={styles.value}
          >
            {batch.transactionHash ?? 'Unavailable'}
          </Text>

        </View>

        <View style={styles.card}>

          <Text style={styles.label}>
            Status
          </Text>

          <Text style={styles.value}>
            {batch.status}
          </Text>

          <Text
            style={[
              styles.label,
              {
                marginTop: 15,
              },
            ]}
          >
            QR Code
          </Text>

          <Text
            numberOfLines={2}
            style={styles.value}
          >
            {batch.qrCode ?? 'Unavailable'}
          </Text>

        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate(
              'Main',
              {
                screen: 'Scanner',
              },
            )
          }
        >

          <Text style={styles.buttonText}>
            Scan Another Batch
          </Text>

        </TouchableOpacity>

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

  banner: {
    padding: 22,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 25,
  },

  bannerText: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 12,
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
  },

  subtitle: {
    color: COLORS.subtitle,
    marginTop: 4,
    marginBottom: 18,
  },

  sectionTitle: {
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 18,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
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

  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
  },

  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 17,
  },

});
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
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import Toast from 'react-native-toast-message';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import {
  inventoryService,
} from '../../services/inventoryService';

import {
  COLORS,
} from '../../utils/theme';

import type {
  BlockchainVerification,
} from '../../types/inventory';

import PageHeader
  from '../../components/common/PageHeader';

export default function InventoryDetailScreen() {

  const route =
    useRoute<any>();

  const navigation =
    useNavigation<any>();

  const {
    inventory,
  } = route.params;

  const [
    verification,
    setVerification,
  ] = useState<BlockchainVerification>();

  const [
    loading,
    setLoading,
  ] = useState(false);

  const batch =
    inventory.batch;

  const verify = useCallback(async () => {

    try {

      setLoading(true);

      const data =
        await inventoryService.verifyBatch(
          inventory.batch.batchNumber,
        );

      setVerification(data);

      Toast.show({

        type:
          data.verified
            ? 'success'
            : 'error',

        text1:
          data.verified
            ? 'Batch Verified'
            : 'Batch Tampered',

      });

    }

    finally {

      setLoading(false);

    }

  }, [inventory.batch.batchNumber]);

  useEffect(() => {

    verify();

  }, [verify]);

  const daysRemaining = useMemo(() => {

    const expiry =
      new Date(
        batch.expiryDate,
      );

    const today =
      new Date();

    return Math.ceil(

      (
        expiry.getTime() -
        today.getTime()
      ) / 86400000,

    );

  }, [batch.expiryDate]);

  const manufactureDate =
    useMemo(

      () =>
        new Date(
          batch.manufactureDate,
        ).toLocaleDateString(),

      [batch.manufactureDate],

    );

  const expiryDate =
    useMemo(

      () =>
        new Date(
          batch.expiryDate,
        ).toLocaleDateString(),

      [batch.expiryDate],

    );

  const openQRCode =
    useCallback(() => {

      navigation.navigate(
        'QRCode',
        {
          batch,
        },
      );

    }, [
      navigation,
      batch,
    ]);

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
          title="Inventory Details"
          subtitle="View complete batch information"
          onBack={() => navigation.goBack()}
        />

        <View
          style={styles.iconContainer}
        >

          <View
            style={styles.iconCircle}
          >

            <MaterialIcons
              name="inventory"
              size={46}
              color={COLORS.primary}
            />

          </View>

        </View>

        <View
          style={styles.card}
        >

          <Text
            style={styles.title}
          >
            {batch.drugName}
          </Text>

          <Text style={styles.label}>
            Batch Number
          </Text>

          <Text style={styles.value}>
            {batch.batchNumber}
          </Text>

          <Text style={styles.label}>
            Manufacturer
          </Text>

          <Text style={styles.value}>
            {batch.manufacturer.name}
          </Text>

          <Text style={styles.label}>
            Quantity
          </Text>

          <Text style={styles.value}>
            {inventory.quantity.toLocaleString()} Units
          </Text>

          <Text style={styles.label}>
            Status
          </Text>

          <Text style={styles.value}>
            {batch.status}
          </Text>

          <Text style={styles.label}>
            Manufactured
          </Text>

          <Text style={styles.value}>
            {manufactureDate}
          </Text>

          <Text style={styles.label}>
            Expiry
          </Text>

          <Text style={styles.value}>
            {expiryDate}
          </Text>

          <Text
            style={[
              styles.daysRemaining,
              {
                color:
                  daysRemaining > 180
                    ? COLORS.success
                    : daysRemaining > 30
                    ? COLORS.warning
                    : COLORS.danger,
              },
            ]}
          >
            {
              daysRemaining < 0
                ? 'Expired'
                : `${daysRemaining} Days Remaining`
            }
          </Text>

          <Text style={styles.label}>
            QR Code
          </Text>

          <Text style={styles.value}>
            {batch.qrCode ?? '-'}
          </Text>

        </View>

        <View
          style={styles.card}
        >

          <View
            style={styles.statusRow}
          >

            <MaterialIcons
              name={
                verification?.verified
                  ? 'verified'
                  : 'error'
              }
              size={30}
              color={
                verification?.verified
                  ? COLORS.success
                  : COLORS.danger
              }
            />

            <Text
              style={styles.statusTitle}
            >
              Blockchain Status
            </Text>

          </View>

          <Text
            style={[
              styles.verifyStatus,
              {
                color:
                  verification?.verified
                    ? COLORS.success
                    : COLORS.danger,
              },
            ]}
          >
            {
              verification?.verified
                ? 'Verified'
                : 'Verification Failed'
            }
          </Text>

          <Text
            style={styles.hashLabel}
          >
            Current Hash
          </Text>

          <Text
            numberOfLines={2}
          >
            {verification?.currentHash}
          </Text>

          <Text
            style={styles.hashLabel}
          >
            Blockchain Hash
          </Text>

          <Text
            numberOfLines={2}
          >
            {verification?.blockchainHash}
          </Text>

          <TouchableOpacity
            onPress={verify}
            disabled={loading}
            style={styles.primaryButton}
          >

            <Text
              style={styles.buttonText}
            >
              {
                loading
                  ? 'Verifying...'
                  : 'Verify Again'
              }
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            onPress={openQRCode}
            style={styles.secondaryButton}
          >

            <Text
              style={styles.buttonText}
            >
              View QR Code
            </Text>

          </TouchableOpacity>

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
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
  },

  label: {
    marginTop: 12,
    color: COLORS.subtitle,
    fontSize: 13,
  },

  value: {
    fontWeight: '700',
    marginTop: 4,
  },

  daysRemaining: {
    marginTop: 10,
    fontWeight: '700',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusTitle: {
    marginLeft: 10,
    fontWeight: '700',
    fontSize: 18,
  },

  verifyStatus: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: '700',
  },

  hashLabel: {
    marginTop: 14,
    color: COLORS.subtitle,
  },

  primaryButton: {
    marginTop: 22,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  secondaryButton: {
    marginTop: 18,
    backgroundColor: COLORS.information,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: 'white',
    fontWeight: '700',
  },

});
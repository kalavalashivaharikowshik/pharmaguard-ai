import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import QRCode from 'react-native-qrcode-svg';

import {
  useRoute,
} from '@react-navigation/native';

import { COLORS } from '../../utils/theme';

export default function QRCodeScreen() {

  const route = useRoute<any>();

  const { batch } = route.params;

  return (

    <SafeAreaView
      style={styles.container}
    >

      <Text
        style={styles.title}
      >
        {batch.drugName}
      </Text>

      <Text
        style={styles.subtitle}
      >
        {batch.batchNumber}
      </Text>

      <QRCode
        value={batch.qrCode ?? batch.batchNumber}
        size={260}
      />

      <Text
        style={styles.footer}
      >
        Scan to verify this batch
      </Text>

    </SafeAreaView>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
  },

  subtitle: {
    color: COLORS.subtitle,
    marginTop: 8,
    marginBottom: 35,
  },

  footer: {
    marginTop: 30,
    fontWeight: '600',
    color: COLORS.subtitle,
  },

});
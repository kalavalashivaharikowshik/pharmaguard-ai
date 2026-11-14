import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import {
  CameraView,
  CameraType,
  useCameraPermissions,
} from 'expo-camera';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import type {
  BarcodeScanningResult,
} from 'expo-camera';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useState,
  useCallback,
} from 'react';

import {
  useNavigation,
} from '@react-navigation/native';

import Toast from 'react-native-toast-message';

import ScannerOverlay from '../../components/scanner/ScannerOverlay';

import { scannerService } from '../../services/scannerService';

import { COLORS } from '../../utils/theme';
import PageHeader from '../../components/common/PageHeader';

export default function ScannerScreen() {

  const navigation =
    useNavigation<any>();

  const [
    permission,
    requestPermission,
  ] = useCameraPermissions();

  const [
    scanned,
    setScanned,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    facing,
    setFacing,
  ] = useState<CameraType>('back');

  const [
    flash,
    setFlash,
  ] = useState(false);

  const toggleFlash =
    useCallback(() => {

      setFlash(prev => !prev);

    }, []);

  const handleScan =
    useCallback(async (
      result: BarcodeScanningResult,
    ) => {

      if (scanned || loading) {

        return;

      }

      setScanned(true);

      setLoading(true);

      try {

        const batchNumber =
          result.data.replace(
            'PG-',
            '',
          );

        const response =
          await scannerService.verifyBatch(
            batchNumber,
          );

        navigation.replace(
          'VerificationResult',
          {
            result: response,
          },
        );

      }

      catch (error: any) {

        Toast.show({

          type: 'error',

          text1: 'Verification Failed',

          text2:
            error?.response?.data?.message ??
            'Unable to verify batch.',

        });

        setScanned(false);

      }

      finally {

        setLoading(false);

      }

    }, [
      scanned,
      loading,
      navigation,
    ]);

  if (!permission) {

    return <View />;

  }

  if (!permission.granted) {

    return (

      <SafeAreaView
        style={styles.permissionSafeArea}
      >

        <View
          style={styles.permissionContainer}
        >

          <MaterialIcons
            name="camera-alt"
            size={80}
            color={COLORS.primary}
          />

          <Text
            style={styles.permissionTitle}
          >
            Camera Permission Required
          </Text>

          <Text
            style={styles.permissionText}
          >
            PharmaGuard AI needs camera access
            to scan pharmaceutical QR codes.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={requestPermission}
          >

            <Text
              style={styles.buttonText}
            >
              Grant Permission
            </Text>

          </TouchableOpacity>

        </View>

      </SafeAreaView>

    );

  }

  return (

    <SafeAreaView
      style={styles.scannerContainer}
    >

      <View
        style={styles.cameraWrapper}
      >

        <CameraView

          style={styles.camera}

          facing={facing}

          enableTorch={flash}

          onBarcodeScanned={
            scanned
              ? undefined
              : handleScan
          }

          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}

        >

          <ScannerOverlay />

          <PageHeader
              title="Scanner"
              subtitle="Scan pharmaceutical QR codes"
              action="History"
              onActionPress={() =>
                navigation.navigate(
                  'ScanHistory',
                )
              }
            />

          <TouchableOpacity

            style={styles.flashButton}

            onPress={toggleFlash}

          >

            <MaterialIcons

              name={
                flash
                  ? 'flash-on'
                  : 'flash-off'
              }

              size={30}

              color="white"

            />

          </TouchableOpacity>

          {

            loading && (

              <View
                style={styles.loading}
              >

                <ActivityIndicator
                  size="large"
                  color="white"
                />

                <Text
                  style={styles.loadingText}
                >
                  Verifying...
                </Text>

              </View>

            )

          }

        </CameraView>

      </View>

    </SafeAreaView>

  );

}

const styles = StyleSheet.create({

  permissionSafeArea: {

    flex: 1,

  },

  permissionContainer: {

    flex: 1,

    justifyContent: 'center',

    alignItems: 'center',

    padding: 30,

    backgroundColor: '#F8FAFC',

  },

  permissionTitle: {

    fontSize: 24,

    fontWeight: '700',

    marginTop: 20,

  },

  permissionText: {

    textAlign: 'center',

    marginTop: 12,

    color: '#64748B',

    fontSize: 16,

    lineHeight: 24,

  },

  button: {

    marginTop: 30,

    backgroundColor: COLORS.primary,

    paddingHorizontal: 30,

    paddingVertical: 15,

    borderRadius: 12,

  },

  buttonText: {

    color: 'white',

    fontWeight: '700',

    fontSize: 16,

  },

  scannerContainer: {

    flex: 1,

    backgroundColor: 'black',

  },

  cameraWrapper: {

    flex: 1,

  },

  camera: {

    flex: 1,

  },

  header: {

    marginTop: 70,

    alignItems: 'center',

  },

  title: {

    color: 'white',

    fontSize: 28,

    fontWeight: '700',

  },

  subtitle: {

    color: 'white',

    marginTop: 10,

    fontSize: 16,

  },

  flashButton: {

    position: 'absolute',

    bottom: 60,

    alignSelf: 'center',

    backgroundColor: 'rgba(0,0,0,0.5)',

    padding: 18,

    borderRadius: 40,

  },

  loading: {

    ...StyleSheet.absoluteFillObject,

    justifyContent: 'center',

    alignItems: 'center',

    backgroundColor: 'rgba(0,0,0,0.6)',

  },

  loadingText: {

    color: 'white',

    marginTop: 15,

    fontSize: 16,

  },

});
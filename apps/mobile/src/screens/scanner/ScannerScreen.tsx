import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { scannerService } from '../../services/scannerService';
import { Button, Icon, T, haptic } from '../../ui/components';
import { brand, radius, space, useTheme } from '../../ui/theme';
import { errMsg } from '../../ui/format';

const FRAME = 250;

export default function ScannerScreen() {
  const navigation = useNavigation<any>();
  const focused = useIsFocused();
  const { c } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState(false);
  const [code, setCode] = useState('');
  const lock = useRef(false);
  const line = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(line, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(line, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [line]);

  useEffect(() => {
    if (focused) lock.current = false;
  }, [focused]);

  const verify = async (value: string) => {
    if (lock.current || !value.trim()) return;
    lock.current = true;
    setBusy(true);
    haptic.light();
    try {
      const result = await scannerService.scan(value.trim());
      if (result.verdict === 'SAFE') haptic.success();
      else if (result.verdict === 'WARNING') haptic.warning();
      else haptic.error();
      setManual(false);
      setCode('');
      navigation.navigate('ScanResult', { result });
    } catch (e) {
      haptic.error();
      Toast.show({ type: 'error', text1: 'Could not verify', text2: errMsg(e, 'Check your connection and try again.') });
      lock.current = false;
    } finally {
      setBusy(false);
    }
  };

  const granted = permission?.granted;

  return (
    <View style={[styles.root, { backgroundColor: '#000' }]}>
      {granted && focused && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{ barcodeTypes: ['qr', 'code128', 'datamatrix'] }}
          onBarcodeScanned={busy ? undefined : ({ data }) => verify(data)}
        />
      )}

      {/* Dimmed overlay with a cut-out frame */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.dim} />
        <View style={{ flexDirection: 'row' }}>
          <View style={styles.dim} />
          <View style={styles.frame}>
            {(['tl', 'tr', 'bl', 'br'] as const).map((k) => (
              <View key={k} style={[styles.corner, styles[k]]} />
            ))}
            <Animated.View
              style={[styles.scanLine, { transform: [{ translateY: line.interpolate({ inputRange: [0, 1], outputRange: [8, FRAME - 10] }) }] }]}
            />
          </View>
          <View style={styles.dim} />
        </View>
        <View style={[styles.dim, { flex: 1.3 }]} />
      </View>

      <SafeAreaView edges={['top']} style={styles.topBar}>
        <View>
          <T variant="h2" color="#FFF">
            Scan medicine
          </T>
          <T variant="small" color="rgba(255,255,255,0.75)">
            Point at the QR code on the pack
          </T>
        </View>
        <Pressable onPress={() => navigation.navigate('ScanHistory')} style={styles.glassBtn} accessibilityLabel="Scan history">
          <Icon name="history" color="#FFF" />
        </Pressable>
      </SafeAreaView>

      {!granted && (
        <View style={styles.permission}>
          <View style={[styles.permIcon, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
            <Icon name="camera-outline" size={40} color="#FFF" />
          </View>
          <T variant="h3" color="#FFF" center>
            Camera access needed
          </T>
          <T color="rgba(255,255,255,0.75)" center style={{ marginTop: 6, marginBottom: space.lg }}>
            PharmaGuard uses the camera only to read medicine QR codes.
          </T>
          <Button title="Allow camera" icon="camera" onPress={requestPermission} />
        </View>
      )}

      {busy && (
        <View style={styles.busy}>
          <ActivityIndicator color="#FFF" size="large" />
          <T color="#FFF" style={{ marginTop: 10, fontWeight: '700' }}>
            Verifying on blockchain…
          </T>
        </View>
      )}

      <View style={styles.bottom}>
        <Pressable onPress={() => setTorch((t) => !t)} style={styles.glassBtnLg} accessibilityLabel="Toggle flashlight">
          <Icon name={torch ? 'flashlight' : 'flashlight-off'} size={26} color="#FFF" />
          <T variant="tiny" color="#FFF">
            Light
          </T>
        </Pressable>
        <Pressable onPress={() => setManual(true)} style={[styles.manualBtn]} accessibilityLabel="Enter batch number">
          <Icon name="keyboard-outline" size={22} color={brand.blue} />
          <T variant="bodyStrong" color={brand.blue}>
            Enter code
          </T>
        </Pressable>
        <View style={{ width: 64 }} />
      </View>

      <Modal visible={manual} transparent animationType="slide" onRequestClose={() => setManual(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: c.overlay }}>
          <Pressable style={{ flex: 1 }} onPress={() => setManual(false)} />
          <View style={[styles.sheet, { backgroundColor: c.surface }]}>
            <View style={[styles.grabber, { backgroundColor: c.border }]} />
            <T variant="h3">Enter batch number</T>
            <T variant="small" muted style={{ marginTop: 4, marginBottom: space.lg }}>
              Type the batch number or QR code printed on the pack.
            </T>
            <TextInput
              value={code}
              onChangeText={setCode}
              autoFocus
              autoCapitalize="characters"
              placeholder="e.g. PCM-2026-001"
              placeholderTextColor={c.textSoft}
              onSubmitEditing={() => verify(code)}
              style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.bg }]}
            />
            <Button title="Verify" icon="shield-search" loading={busy} disabled={!code.trim()} onPress={() => verify(code)} style={{ marginTop: space.lg }} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const C = 30;
const styles = StyleSheet.create({
  root: { flex: 1 },
  dim: { flex: 1, backgroundColor: 'rgba(5,12,24,0.62)' },
  frame: { width: FRAME, height: FRAME },
  corner: { position: 'absolute', width: C, height: C, borderColor: '#5FBF8A' },
  tl: { top: 0, left: 0, borderTopWidth: 5, borderLeftWidth: 5, borderTopLeftRadius: 18 },
  tr: { top: 0, right: 0, borderTopWidth: 5, borderRightWidth: 5, borderTopRightRadius: 18 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 5, borderLeftWidth: 5, borderBottomLeftRadius: 18 },
  br: { bottom: 0, right: 0, borderBottomWidth: 5, borderRightWidth: 5, borderBottomRightRadius: 18 },
  scanLine: { position: 'absolute', left: 12, right: 12, height: 3, borderRadius: 2, backgroundColor: '#5FBF8A', shadowColor: '#5FBF8A', shadowOpacity: 0.9, shadowRadius: 8, elevation: 4 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.lg, paddingTop: space.sm },
  glassBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  glassBtnLg: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', gap: 2 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 120, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.xl },
  manualBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF', paddingVertical: 14, paddingHorizontal: 20, borderRadius: radius.pill },
  permission: { position: 'absolute', left: space.xl, right: space.xl, top: '28%', alignItems: 'center' },
  permIcon: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginBottom: space.lg },
  busy: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,12,24,0.7)', alignItems: 'center', justifyContent: 'center' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: space.xl, paddingBottom: 40 },
  grabber: { width: 44, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: space.lg },
  input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14, fontSize: 17, fontWeight: '700', letterSpacing: 1 },
});

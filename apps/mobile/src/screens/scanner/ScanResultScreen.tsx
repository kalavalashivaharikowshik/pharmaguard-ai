import { useEffect, useRef } from 'react';
import { Animated, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ScanResult } from '../../services/scannerService';
import { Badge, Button, Card, Icon, type IconName, KeyValue, T } from '../../ui/components';
import { space, useTheme } from '../../ui/theme';
import { fmtDate, fmtDateTime } from '../../ui/format';

const LOOK: Record<ScanResult['verdict'], { colors: [string, string]; icon: IconName; label: string }> = {
  SAFE: { colors: ['#1F7A4A', '#2E8B57'], icon: 'shield-check', label: 'SAFE' },
  WARNING: { colors: ['#B45309', '#D97706'], icon: 'shield-alert', label: 'USE FIRST' },
  BLOCKED: { colors: ['#991B1B', '#DC2626'], icon: 'shield-off', label: 'BLOCKED' },
  COUNTERFEIT: { colors: ['#7F1D1D', '#B91C1C'], icon: 'alert-octagon', label: 'UNKNOWN' },
};

export default function ScanResultScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const result: ScanResult = params.result;
  const { c } = useTheme();
  const look = LOOK[result.verdict];
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
  }, [pop]);

  const b = result.batch;
  const chain = result.blockchain;

  const share = () =>
    Share.share({
      message: `PharmaGuard AI verification\n${b ? `${b.drugName} (${b.batchNumber})\n` : ''}Result: ${result.headline}\n${result.reasons.join('\n')}\nScanned ${fmtDateTime(result.scannedAt)}`,
    }).catch(() => undefined);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <LinearGradient colors={look.colors} style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroTop}>
            <Badge label="Scan result" tone="neutral" size="sm" />
          </View>
          <Animated.View style={[styles.verdictIcon, { transform: [{ scale: pop }] }]}>
            <Icon name={look.icon} size={64} color="#FFFFFF" />
          </Animated.View>
          <T variant="tiny" color="rgba(255,255,255,0.85)" center style={{ letterSpacing: 3, marginTop: space.md }}>
            {look.label}
          </T>
          <T variant="h1" color="#FFFFFF" center style={{ marginTop: 4 }}>
            {result.headline}
          </T>
          {b && (
            <T color="rgba(255,255,255,0.9)" center style={{ marginTop: 6 }}>
              {b.drugName} · {b.batchNumber}
            </T>
          )}
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40, marginTop: -28 }}>
        <Card>
          <T variant="title" style={{ marginBottom: space.sm }}>
            Why
          </T>
          {result.reasons.map((r) => (
            <View key={r} style={styles.reason}>
              <Icon
                name={result.verdict === 'SAFE' ? 'check-circle' : result.verdict === 'WARNING' ? 'clock-alert' : 'close-circle'}
                size={20}
                color={result.verdict === 'SAFE' ? c.success : result.verdict === 'WARNING' ? c.warning : c.danger}
              />
              <T style={{ flex: 1 }}>{r}</T>
            </View>
          ))}
        </Card>

        {b && (
          <Card style={{ marginTop: space.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <T variant="title">Batch details</T>
              <Badge status={b.status} size="sm" />
            </View>
            <KeyValue label="Medicine" value={b.drugName} />
            <KeyValue label="Batch number" value={b.batchNumber} />
            <KeyValue label="Manufacturer" value={b.manufacturer} />
            <KeyValue label="Manufactured" value={fmtDate(b.manufactureDate)} />
            <KeyValue label="Expiry" value={`${fmtDate(b.expiryDate)}${b.daysToExpiry > 0 ? ` · ${b.daysToExpiry}d left` : ''}`} />
            {b.category ? <KeyValue label="Category" value={b.category} /> : null}
            {b.storageConditions ? <KeyValue label="Storage" value={b.storageConditions} /> : null}
            <KeyValue label="Units you hold" value={b.unitsHeld} />
          </Card>
        )}

        {result.recall && (
          <Card style={{ marginTop: space.md, borderColor: c.danger }}>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Icon name="shield-alert" color={c.danger} />
              <T variant="title">Recall {result.recall.recallNumber}</T>
              <Badge status={result.recall.severity} size="sm" />
            </View>
            <T muted style={{ marginTop: 8 }}>
              {result.recall.reason}
            </T>
          </Card>
        )}

        {chain && (
          <Card style={{ marginTop: space.md }}>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 4 }}>
              <Icon name="link-variant" color={c.primary} />
              <T variant="title" style={{ flex: 1 }}>
                Blockchain proof
              </T>
              <Badge
                label={!chain.enabled ? 'Off' : chain.revokedOnChain ? 'Revoked' : chain.verified ? 'Verified' : 'Mismatch'}
                tone={!chain.enabled ? 'neutral' : chain.verified && !chain.revokedOnChain ? 'success' : 'danger'}
                icon={chain.verified && !chain.revokedOnChain ? 'check' : 'close'}
                size="sm"
              />
            </View>
            <KeyValue label="Network" value={chain.network} />
            {chain.contractAddress ? <KeyValue label="Contract" value={short(chain.contractAddress)} mono /> : null}
            {chain.transactionHash ? <KeyValue label="Registration tx" value={short(chain.transactionHash)} mono /> : null}
            {chain.fingerprint ? <KeyValue label="Fingerprint" value={short(chain.fingerprint)} mono /> : null}
          </Card>
        )}

        <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.xl }}>
          <Button title="Share" icon="share-variant" variant="secondary" onPress={share} style={{ flex: 1 }} />
          <Button title="Scan again" icon="qrcode-scan" onPress={() => navigation.goBack()} style={{ flex: 1.4 }} />
        </View>
        {b && (
          <Button
            title="View batch"
            variant="ghost"
            icon="package-variant"
            onPress={() => navigation.navigate('InventoryDetail', { batchId: b.id, batchNumber: b.batchNumber })}
            style={{ marginTop: space.sm }}
          />
        )}
      </ScrollView>
    </View>
  );
}

function short(v: string) {
  return v.length > 18 ? `${v.slice(0, 10)}…${v.slice(-6)}` : v;
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: space.xl, paddingBottom: 52, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroTop: { flexDirection: 'row', justifyContent: 'center', paddingTop: space.sm },
  verdictIcon: { alignSelf: 'center', width: 112, height: 112, borderRadius: 56, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginTop: space.lg },
  reason: { flexDirection: 'row', gap: 10, paddingVertical: 6, alignItems: 'flex-start' },
});


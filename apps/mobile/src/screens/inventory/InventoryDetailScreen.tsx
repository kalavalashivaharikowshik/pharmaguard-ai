import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { inventoryService } from '../../services/inventoryService';
import { Badge, Button, Card, GradientCard, Header, Icon, KeyValue, ProgressBar, Screen, Skeleton, T, haptic } from '../../ui/components';
import { space, useTheme } from '../../ui/theme';
import { can, daysUntil, errMsg, fmtDate } from '../../ui/format';

/** Batch detail: shelf life, blockchain verification, QR code and actions. */
export default function InventoryDetailScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { user } = useAuth();
  const { c } = useTheme();
  const [batch, setBatch] = useState<any>(params?.item?.batch ?? null);
  const units: number | undefined = params?.item?.quantity;
  const [verifying, setVerifying] = useState(false);
  const [chain, setChain] = useState<any>(null);

  const batchId = params?.item?.batch?.id ?? params?.batchId;

  const load = useCallback(async () => {
    if (!batchId) return;
    try {
      const res = await api.get(`/batches/${batchId}`);
      setBatch(res.data);
    } catch {
      /* keep what we have */
    }
  }, [batchId]);

  useEffect(() => {
    load();
  }, [load]);

  const verify = async () => {
    if (!batch) return;
    setVerifying(true);
    try {
      const r = await inventoryService.verifyBatch(batch.batchNumber);
      setChain(r);
      if (r.verified) haptic.success();
      else haptic.error();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Verification failed', text2: errMsg(e) });
    } finally {
      setVerifying(false);
    }
  };

  if (!batch) {
    return (
      <Screen>
        <Header title="Batch" onBack={() => navigation.goBack()} />
        <Skeleton height={160} />
        <Skeleton height={220} style={{ marginTop: space.lg }} />
      </Screen>
    );
  }

  const total = new Date(batch.expiryDate).getTime() - new Date(batch.manufactureDate).getTime();
  const used = Date.now() - new Date(batch.manufactureDate).getTime();
  const life = Math.max(0, Math.min(100, 100 - (used / total) * 100));
  const days = daysUntil(batch.expiryDate);

  return (
    <Screen>
      <Header title="Batch details" onBack={() => navigation.goBack()} right={<Badge status={batch.status} />} />

      <GradientCard>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="pill" size={28} color="#FFF" />
          </View>
          <View style={{ flex: 1 }}>
            <T variant="h2" color="#FFF" numberOfLines={2}>
              {batch.drugName}
            </T>
            <T color="rgba(255,255,255,0.85)">{batch.batchNumber}</T>
          </View>
        </View>
        <View style={{ flexDirection: 'row', marginTop: space.lg }}>
          <View style={{ flex: 1 }}>
            <T variant="h3" color="#FFF">
              {units !== undefined ? units.toLocaleString('en-IN') : batch.quantity?.toLocaleString('en-IN')}
            </T>
            <T variant="tiny" color="rgba(255,255,255,0.75)">
              {units !== undefined ? 'UNITS YOU HOLD' : 'UNITS PRODUCED'}
            </T>
          </View>
          <View style={{ flex: 1 }}>
            <T variant="h3" color="#FFF">
              {days <= 0 ? 'Expired' : `${days} days`}
            </T>
            <T variant="tiny" color="rgba(255,255,255,0.75)">
              SHELF LIFE LEFT
            </T>
          </View>
        </View>
      </GradientCard>

      <Card style={{ marginTop: space.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <T variant="title">Shelf life</T>
          <T variant="small" muted>
            {Math.round(life)}% remaining
          </T>
        </View>
        <ProgressBar value={life} tone={life < 10 ? 'danger' : life < 25 ? 'warning' : 'success'} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <T variant="small" muted>
            {fmtDate(batch.manufactureDate)}
          </T>
          <T variant="small" muted>
            {fmtDate(batch.expiryDate)}
          </T>
        </View>
      </Card>

      <Card style={{ marginTop: space.md }}>
        <T variant="title" style={{ marginBottom: 4 }}>
          Information
        </T>
        <KeyValue label="Manufacturer" value={batch.manufacturer?.name} />
        {batch.category ? <KeyValue label="Category" value={batch.category} /> : null}
        {batch.storageConditions ? <KeyValue label="Storage" value={batch.storageConditions} /> : null}
        <KeyValue label="QR code" value={batch.qrCode} mono />
        {batch.revocationReason ? <KeyValue label="Revocation" value={batch.revocationReason.replace(/_/g, ' ')} /> : null}
      </Card>

      <Card style={{ marginTop: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name="link-variant" color={c.primary} />
          <T variant="title" style={{ flex: 1 }}>
            Blockchain
          </T>
          {chain && (
            <Badge
              label={chain.action === 'BLOCKCHAIN_DISABLED' ? 'Off' : chain.verified ? 'Verified' : 'Tampered'}
              tone={chain.verified ? 'success' : chain.action === 'BLOCKCHAIN_DISABLED' ? 'neutral' : 'danger'}
              icon={chain.verified ? 'check' : 'close'}
            />
          )}
        </View>
        <T variant="small" muted style={{ marginTop: 6 }}>
          Recomputes this batch's fingerprint and compares it with the one stored on-chain.
        </T>
        {chain?.network && <KeyValue label="Network" value={chain.network} />}
        {batch.transactionHash ? <KeyValue label="Tx" value={`${batch.transactionHash.slice(0, 10)}…${batch.transactionHash.slice(-6)}`} mono /> : null}
        <Button title={chain ? 'Verify again' : 'Verify on blockchain'} icon="shield-search" variant="secondary" loading={verifying} onPress={verify} style={{ marginTop: space.md }} />
      </Card>

      <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.lg }}>
        <Button title="QR code" icon="qrcode" variant="secondary" onPress={() => navigation.navigate('QRCode', { batch })} style={{ flex: 1 }} />
        {can.transfer(user?.role) && batch.status === 'ACTIVE' && (
          <Button title="Transfer" icon="truck-fast-outline" onPress={() => navigation.navigate('CreateTransfer', { batchId: batch.id })} style={{ flex: 1 }} />
        )}
      </View>
    </Screen>
  );
}

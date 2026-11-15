import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { inventoryService } from '../../services/inventoryService';
import { transferService } from '../../services/transferService';
import type { InventoryBatch } from '../../types/inventory';
import { Button, Card, Empty, Field, Header, Icon, Screen, SearchBar, Skeleton, T, haptic } from '../../ui/components';
import { radius, space, useTheme } from '../../ui/theme';
import { errMsg, fmtDate, ROLE_LABEL } from '../../ui/format';

type Receiver = { id: string; fullName: string; role: string; organizationName?: string; city?: string };

export default function CreateTransferScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const { c } = useTheme();
  const [stock, setStock] = useState<InventoryBatch[] | null>(null);
  const [receivers, setReceivers] = useState<Receiver[]>([]);
  const [batchId, setBatchId] = useState<string | undefined>(params?.batchId);
  const [toUserId, setToUserId] = useState<string>();
  const [qty, setQty] = useState('');
  const [q, setQ] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    inventoryService.getMyInventory().then((s) => setStock(s.filter((i) => i.quantity > 0 && i.batch.status !== 'REVOKED' && i.batch.status !== 'RECALLED')));
    transferService.getTransferUsers().then(setReceivers).catch(() => setReceivers([]));
  }, []);

  const selected = stock?.find((s) => s.batch.id === batchId);
  const receiver = receivers.find((r) => r.id === toUserId);
  const amount = Number(qty);
  const qtyError = qty && (!Number.isInteger(amount) || amount <= 0) ? 'Enter a whole number above 0' : selected && amount > selected.quantity ? `You only have ${selected.quantity} units` : undefined;
  const filteredStock = useMemo(() => (stock ?? []).filter((s) => !q || `${s.batch.drugName} ${s.batch.batchNumber}`.toLowerCase().includes(q.toLowerCase())), [stock, q]);

  const submit = async () => {
    if (!selected || !receiver || !amount || qtyError) return;
    setSaving(true);
    try {
      const res = await transferService.createTransfer({ batchId: selected.batch.id, toUserId: receiver.id, quantity: amount });
      haptic.success();
      Toast.show({
        type: 'success',
        text1: res?.queued ? 'Saved offline' : 'Transfer completed',
        text2: res?.queued ? 'It will be sent when you are back online.' : `${amount} units sent to ${receiver.organizationName ?? receiver.fullName}`,
      });
      navigation.goBack();
    } catch (e) {
      haptic.error();
      Toast.show({ type: 'error', text1: 'Transfer failed', text2: errMsg(e) });
    } finally {
      setSaving(false);
    }
  };

  const Step = ({ n, title, done }: { n: number; title: string; done: boolean }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: space.xl, marginBottom: space.md }}>
      <View style={{ width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? c.success : c.primary }}>
        {done ? <Icon name="check" size={16} color="#FFF" /> : <T variant="tiny" color="#FFF">{n}</T>}
      </View>
      <T variant="h3">{title}</T>
    </View>
  );

  const Option = ({ active, onPress, title, subtitle, right }: { active: boolean; onPress(): void; title: string; subtitle: string; right?: string }) => (
    <Pressable
      onPress={() => {
        haptic.tap();
        onPress();
      }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: space.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: active ? c.primary : c.border, backgroundColor: active ? c.primarySoft : c.surface, marginBottom: space.sm }}
    >
      <Icon name={active ? 'radiobox-marked' : 'radiobox-blank'} color={active ? c.primary : c.textSoft} />
      <View style={{ flex: 1 }}>
        <T variant="bodyStrong" numberOfLines={1}>
          {title}
        </T>
        <T variant="small" muted numberOfLines={1}>
          {subtitle}
        </T>
      </View>
      {right ? <T variant="bodyStrong">{right}</T> : null}
    </Pressable>
  );

  return (
    <Screen>
      <Header title="New transfer" subtitle="Move stock to the next organisation" onBack={() => navigation.goBack()} />

      <Step n={1} title="Choose batch" done={!!selected} />
      {!stock ? (
        <Skeleton height={64} />
      ) : stock.length === 0 ? (
        <Card>
          <Empty icon="package-variant" title="No stock to transfer" message="You don't hold any active batches." />
        </Card>
      ) : (
        <>
          {stock.length > 4 && (
            <View style={{ marginBottom: space.sm }}>
              <SearchBar value={q} onChangeText={setQ} placeholder="Search your stock" />
            </View>
          )}
          {filteredStock.slice(0, 8).map((s) => (
            <Option
              key={s.id}
              active={s.batch.id === batchId}
              onPress={() => setBatchId(s.batch.id)}
              title={s.batch.drugName}
              subtitle={`${s.batch.batchNumber} · exp ${fmtDate(s.batch.expiryDate)}`}
              right={`${s.quantity}`}
            />
          ))}
        </>
      )}

      <Step n={2} title="Send to" done={!!receiver} />
      {receivers.length === 0 ? (
        <T muted>No eligible receivers for your role.</T>
      ) : (
        receivers.map((r) => (
          <Option
            key={r.id}
            active={r.id === toUserId}
            onPress={() => setToUserId(r.id)}
            title={r.organizationName ?? r.fullName}
            subtitle={`${ROLE_LABEL[r.role] ?? r.role}${r.city ? ` · ${r.city}` : ''}`}
          />
        ))
      )}

      <Step n={3} title="Quantity" done={!!amount && !qtyError} />
      <Field value={qty} onChangeText={(v) => setQty(v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" placeholder={selected ? `Up to ${selected.quantity}` : 'Units'} icon="cube-outline" error={qtyError} />
      {selected && (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: -8, marginBottom: space.lg }}>
          {[0.25, 0.5, 1].map((f) => (
            <Pressable key={f} onPress={() => setQty(String(Math.max(1, Math.floor(selected.quantity * f))))} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: c.surfaceAlt }}>
              <T variant="small" style={{ fontWeight: '700' }}>
                {f === 1 ? 'All' : `${f * 100}%`}
              </T>
            </Pressable>
          ))}
        </View>
      )}

      <Button title="Send transfer" icon="send" loading={saving} disabled={!selected || !receiver || !amount || !!qtyError} onPress={submit} style={{ marginTop: space.md }} />
    </Screen>
  );
}

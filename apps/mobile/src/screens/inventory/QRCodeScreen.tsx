import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Badge, Button, Card, Header, Screen, T } from '../../ui/components';
import { brand, space } from '../../ui/theme';

export default function QRCodeScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<any>();
  const batch = params.batch;
  return (
    <Screen>
      <Header title="Batch QR code" onBack={() => navigation.goBack()} />
      <Card style={{ alignItems: 'center', paddingVertical: space.xxl }}>
        <T variant="h2" center>
          {batch.drugName}
        </T>
        <T muted center style={{ marginTop: 4, marginBottom: space.xl }}>
          {batch.batchNumber}
        </T>
        <View style={{ padding: 16, backgroundColor: '#FFF', borderRadius: 16 }}>
          <QRCode value={batch.qrCode ?? `PG-${batch.batchNumber}`} size={220} color={brand.blueDark} backgroundColor="#FFFFFF" />
        </View>
        <View style={{ marginTop: space.xl }}>
          <Badge status={batch.status} />
        </View>
        <T variant="small" muted center style={{ marginTop: space.lg, maxWidth: 260 }}>
          Scan with PharmaGuard to check authenticity, recall and expiry status.
        </T>
      </Card>
      <Button title="Done" onPress={() => navigation.goBack()} style={{ marginTop: space.lg }} />
    </Screen>
  );
}

import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Avatar, Badge, Button, Card, GradientCard, Header, KeyValue, ListRow, Screen, T } from '../../ui/components';
import { space } from '../../ui/theme';
import { fmtDate, ROLE_LABEL } from '../../ui/format';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const [me, setMe] = useState<any>(user);

  useEffect(() => {
    api
      .get('/users/me')
      .then((r) => setMe(r.data))
      .catch(() => undefined);
  }, []);

  return (
    <Screen>
      <Header title="Profile" onBack={() => navigation.goBack()} />
      <GradientCard style={{ alignItems: 'center' }}>
        <View style={{ borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)', borderRadius: 48 }}>
          <Avatar name={me?.fullName} size={84} />
        </View>
        <T variant="h2" color="#FFF" center style={{ marginTop: space.md }}>
          {me?.fullName}
        </T>
        <T color="rgba(255,255,255,0.85)" center>
          {me?.email}
        </T>
        <View style={{ marginTop: space.md }}>
          <Badge label={ROLE_LABEL[me?.role] ?? me?.role} tone="neutral" icon="shield-account" />
        </View>
      </GradientCard>

      <Card style={{ marginTop: space.lg }}>
        <T variant="title" style={{ marginBottom: 4 }}>
          Organisation
        </T>
        <KeyValue label="Name" value={me?.organizationName} />
        <KeyValue label="City" value={me?.city} />
        <KeyValue label="Phone" value={me?.phone} />
        {me?.manufacturer?.licenseNumber ? <KeyValue label="Licence" value={me.manufacturer.licenseNumber} /> : null}
        <KeyValue label="Member since" value={fmtDate(me?.createdAt)} />
        <KeyValue label="Status" value={me?.status} />
      </Card>

      <Card padded={false} style={{ marginTop: space.md, paddingHorizontal: space.lg }}>
        <ListRow icon="lock-reset" title="Change password" onPress={() => navigation.navigate('ChangePassword')} />
        <ListRow icon="cog-outline" iconTone="neutral" title="Settings" onPress={() => navigation.navigate('Settings')} last />
      </Card>

      <Button title="Log out" icon="logout" variant="secondary" onPress={logout} style={{ marginTop: space.xl }} />
    </Screen>
  );
}

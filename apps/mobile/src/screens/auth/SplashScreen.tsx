import { ActivityIndicator, View } from 'react-native';

import { AuthBackground, LogoMark, Wordmark } from './AuthBrand';
import { space } from '../../ui/theme';

export default function SplashScreen() {
  return (
    <AuthBackground>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.xl }}>
        <LogoMark size={96} />
        <Wordmark />
        <ActivityIndicator color="#FFFFFF" style={{ marginTop: space.xl }} />
      </View>
    </AuthBackground>
  );
}

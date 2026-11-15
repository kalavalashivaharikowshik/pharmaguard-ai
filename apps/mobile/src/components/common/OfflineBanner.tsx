import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNetwork } from '../../context/NetworkContext';
import { Icon, T } from '../../ui/components';

/** Shown at the top while offline; cached data stays visible. */
export default function OfflineBanner() {
  const { isConnected } = useNetwork();
  const insets = useSafeAreaInsets();
  if (isConnected) return null;
  return (
    <View style={{ position: 'absolute', top: insets.top + 6, alignSelf: 'center', zIndex: 100, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#B45309', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 999 }}>
      <Icon name="wifi-off" size={16} color="#FFF" />
      <T variant="small" color="#FFF" style={{ fontWeight: '700' }}>
        Offline · showing saved data
      </T>
    </View>
  );
}

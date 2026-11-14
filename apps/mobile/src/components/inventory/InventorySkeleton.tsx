import { View } from 'react-native';
import { COLORS } from '../../utils/theme';

export default function InventorySkeleton() {
  return (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 18,
        padding: 20,
        marginBottom: 16,
        height: 140,
        opacity: 0.5,
      }}
    />
  );
}
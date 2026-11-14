import {
  View,
  Text,
} from 'react-native';

import { COLORS } from '../../utils/theme';

interface Props {
  status: string;
}

export default function TransferStatusChip({
  status,
}: Props) {

  const backgroundColor =
    status === 'COMPLETED'
      ? COLORS.success
      : status === 'PENDING'
      ? COLORS.warning
      : COLORS.danger;

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 16,
      }}
    >
      <Text
        style={{
          color: 'white',
          fontWeight: '700',
          fontSize: 12,
        }}
      >
        {status}
      </Text>
    </View>
  );
}
import { View, Text } from 'react-native';
import { COLORS } from '../../utils/theme';
import React from 'react';
interface Props {
  status: string;
}

function StatusChip({ status }: Props) {
  const getColor = () => {
    switch (status) {
      case 'ACTIVE':
        return COLORS.success;
      case 'RECALLED':
        return COLORS.warning;
      case 'REVOKED':
        return COLORS.danger;
      case 'EXPIRED':
        return '#7C3AED';
      default:
        return COLORS.subtitle;
    }
  };

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: getColor(),
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 24,
        marginTop: 10,
        elevation: 2,
      }}
    >
      <Text
        style={{
          color: 'white',
          fontWeight: '700',
          fontSize: 13,
        }}
      >
        {status}
      </Text>
    </View>
  );
}
export default React.memo(StatusChip);
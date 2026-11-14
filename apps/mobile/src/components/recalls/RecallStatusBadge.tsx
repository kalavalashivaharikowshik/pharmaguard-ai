import {
  View,
  Text,
} from 'react-native';

import { COLORS } from '../../utils/theme';

interface Props {

  status: string;

}

export default function RecallStatusBadge({

  status,

}: Props) {

  const background =

    status === 'ACTIVE'

      ? COLORS.danger

      : COLORS.success;

  return (

    <View
      style={{

        backgroundColor: background,

        paddingHorizontal: 12,

        paddingVertical: 6,

        borderRadius: 20,

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
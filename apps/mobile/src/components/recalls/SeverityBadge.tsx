import {
  View,
  Text,
} from 'react-native';

import { COLORS } from '../../utils/theme';

interface Props {

  severity: string;

}

export default function SeverityBadge({

  severity,

}: Props) {

  const color = {

    LOW: COLORS.information,

    MEDIUM: COLORS.warning,

    HIGH: '#EA580C',

    CRITICAL: COLORS.danger,

  }[severity] ?? COLORS.subtitle;

  return (

    <View
      style={{

        backgroundColor: color,

        paddingHorizontal: 12,

        paddingVertical: 6,

        borderRadius: 20,

        alignSelf: 'flex-start',

      }}
    >

      <Text
        style={{
          color: 'white',
          fontWeight: '700',
          fontSize: 12,
        }}
      >
        {severity}
      </Text>

    </View>

  );

}
import {
  View,
  Text,
} from 'react-native';

import { COLORS } from '../../utils/theme';

interface Props {

  priority: string;

}

export default function NotificationBadge({

  priority,

}: Props) {

  const color = {

    LOW: COLORS.success,

    MEDIUM: COLORS.information,

    HIGH: COLORS.warning,

    CRITICAL: COLORS.danger,

  }[priority] ?? COLORS.subtitle;

  return (

    <View
      style={{

        backgroundColor: color,

        paddingHorizontal: 12,

        paddingVertical: 5,

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

        {priority}

      </Text>

    </View>

  );

}
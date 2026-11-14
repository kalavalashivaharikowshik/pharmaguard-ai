import {
  View,
  Text,
} from 'react-native';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import { COLORS } from '../../utils/theme';

interface Props {

  title: string;

  value: number;

  icon: string;

  color: string;

}

export default function AnalyticsSummaryCard({

  title,

  value,

  icon,

  color,

}: Props) {

  return (

    <View
      style={{

        backgroundColor: 'white',

        width: '48%',

        borderRadius: 18,

        padding: 18,

        marginBottom: 14,

        elevation: 3,

      }}
    >

      <View
        style={{

          width: 46,

          height: 46,

          borderRadius: 23,

          backgroundColor: `${color}20`,

          justifyContent: 'center',

          alignItems: 'center',

          marginBottom: 14,

        }}
      >

        <MaterialIcons

          name={icon as any}

          size={24}

          color={color}

        />

      </View>

      <Text
        style={{

          color: COLORS.subtitle,

          fontSize: 13,

        }}
      >

        {title}

      </Text>

      <Text
        style={{

          fontSize: 26,

          fontWeight: '700',

          marginTop: 4,

        }}
      >

        {value}

      </Text>

    </View>

  );

}
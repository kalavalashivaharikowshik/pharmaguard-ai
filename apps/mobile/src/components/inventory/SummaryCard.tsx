import {
  View,
  Text,
} from 'react-native';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import {
  COLORS,
} from '../../utils/theme';

interface Props {

  title: string;

  value: number;

  icon?: keyof typeof MaterialIcons.glyphMap;

  color?: string;

}

export default function SummaryCard({

  title,

  value,

  icon = 'inventory',

  color = COLORS.primary,

}: Props) {

  return (

    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 18,
        padding: 18,
        marginBottom: 12,
        elevation: 3,
      }}
    >

      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: color,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >

        <MaterialIcons
          name={icon}
          size={22}
          color="white"
        />

      </View>

      <Text
        style={{
          marginTop: 14,
          color: COLORS.subtitle,
          fontSize: 13,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          marginTop: 8,
          fontSize: 24,
          fontWeight: '700',
          color: COLORS.text,
        }}
      >
        {value.toLocaleString()}
      </Text>

    </View>

  );

}
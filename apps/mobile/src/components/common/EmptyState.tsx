import {
  View,
  Text,
} from 'react-native';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import { COLORS } from '../../utils/theme';

interface Props {

  icon: keyof typeof MaterialIcons.glyphMap;

  title: string;

  subtitle: string;

}

export default function EmptyState({

  icon,

  title,

  subtitle,

}: Props) {

  return (

    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingVertical: 60,
      }}
    >

      <View
        style={{
          width: 90,
          height: 90,
          borderRadius: 45,
          backgroundColor: '#ECFDF5',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >

        <MaterialIcons
          name={icon}
          size={48}
          color={COLORS.primary}
        />

      </View>

      <Text
        style={{
          fontSize: 24,
          fontWeight: '700',
          marginTop: 22,
          color: COLORS.text,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          marginTop: 10,
          color: COLORS.subtitle,
          fontSize: 15,
          textAlign: 'center',
          lineHeight: 22,
        }}
      >
        {subtitle}
      </Text>

    </View>

  );

}
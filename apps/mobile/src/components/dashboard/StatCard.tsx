import {
  View,
  Text,
} from 'react-native';
import React from 'react';
import {
  MaterialIcons,
} from '@expo/vector-icons';

import { COLORS } from '../../utils/theme';

interface Props {

  title: string;

  value: number;

  icon: keyof typeof MaterialIcons.glyphMap;

  color: string;

  suffix?: string;

}

function StatCard({

  title,

  value,

  icon,

  color,

  suffix,

}: Props) {

  return (

    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 18,
        padding: 18,
        margin: 6,
        elevation: 3,
      }}
    >

      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: 23,
          backgroundColor: color,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >

        <MaterialIcons
          name={icon}
          size={24}
          color="white"
        />

      </View>

      <Text
        style={{
          marginTop: 14,
          color: COLORS.subtitle,
          fontSize: 14,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          marginTop: 8,
          fontSize: 26,
          fontWeight: '700',
          color: COLORS.text,
        }}
      >
        {value.toLocaleString()}
        {suffix ? ` ${suffix}` : ''}
      </Text>

    </View>

  );

}
export default React.memo(StatCard);
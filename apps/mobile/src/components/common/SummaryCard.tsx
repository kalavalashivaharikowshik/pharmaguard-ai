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
  value: number | string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

function SummaryCard({
  title,
  value,
  icon,
}: Props) {

  return (

    <View
        style={{
        width: '48%',
        backgroundColor: 'white',
        borderRadius: 18,
        padding: 18,
        marginBottom: 14,
        elevation: 3,
        minHeight: 145,
        justifyContent: 'space-between',
        }}
        >

      <View
        style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: '#ECFDF5',
            justifyContent: 'center',
            alignItems: 'center',
        }}
        >

        <MaterialIcons
            name={icon}
            size={28}
            color={COLORS.primary}
        />

        </View>

      <Text
        style={{
          color: COLORS.subtitle,
          fontSize: 13,
          marginTop: 10,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontSize: 24,
          fontWeight: '700',
          marginTop: 4,
          color: COLORS.text,
        }}
      >
        {value}
      </Text>

    </View>

  );

}
export default React.memo(SummaryCard);
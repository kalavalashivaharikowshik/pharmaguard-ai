import {
  TouchableOpacity,
  Text,
} from 'react-native';
import React from 'react';
import { COLORS } from '../../utils/theme';

interface Props {

  label: string;

  active: boolean;

  onPress(): void;

}

function FilterChip({

  label,

  active,

  onPress,

}: Props) {

  return (

    <TouchableOpacity

      onPress={onPress}

      style={{

        paddingHorizontal: 20,

        paddingVertical: 12,

        borderRadius: 24,

        marginRight: 10,

        backgroundColor:

        active

        ? COLORS.primary

        : COLORS.white,

        borderWidth: 1,

        borderColor: COLORS.border,
        elevation: active ? 2 : 0,

      }}

    >

      <Text

        style={{

          color:

            active

              ? 'white'

              : COLORS.subtitle,

          fontWeight: '600',

        }}

      >

        {label}

      </Text>

    </TouchableOpacity>

  );

}
export default React.memo(FilterChip);
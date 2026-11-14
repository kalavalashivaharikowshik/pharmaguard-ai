import {
  View,
  Text,
} from 'react-native';

import { COLORS } from '../../utils/theme';

interface Props {

  label: string;

  value: string;

}

export default function ProfileInfoCard({

  label,

  value,

}: Props) {

  return (

    <View

      style={{

        backgroundColor: 'white',

        padding: 18,

        borderRadius: 16,

        marginBottom: 14,

      }}

    >

      <Text

        style={{

          color: COLORS.subtitle,

          marginBottom: 6,

        }}

      >

        {label}

      </Text>

      <Text

        style={{

          fontSize: 16,

          fontWeight: '600',

        }}

      >

        {value || '-'}

      </Text>

    </View>

  );

}
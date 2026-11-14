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

  subtitle: string;

}

export default function TimelineItem({

  title,

  subtitle,

}: Props) {

  return (

    <View
      style={{
        flexDirection: 'row',
        marginBottom: 18,
      }}
    >

      <View
        style={{
          width: 32,
          alignItems: 'center',
        }}
      >

        <MaterialIcons
          name="check-circle"
          size={20}
          color={COLORS.success}
        />

        <View
          style={{
            width: 2,
            flex: 1,
            backgroundColor: COLORS.border,
            marginTop: 4,
          }}
        />

      </View>

      <View
        style={{
          marginLeft: 12,
          flex: 1,
        }}
      >

        <Text
          style={{
            fontWeight: '700',
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            color: COLORS.subtitle,
            marginTop: 3,
          }}
        >
          {subtitle}
        </Text>

      </View>

    </View>

  );

}
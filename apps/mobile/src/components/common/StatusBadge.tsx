import {
  View,
  Text,
} from 'react-native';

interface Props {

  label: string;

  color: string;

}

export default function StatusBadge({

  label,

  color,

}: Props) {

  return (

    <View
      style={{

        alignSelf: 'flex-start',

        backgroundColor: `${color}20`,

        paddingHorizontal: 10,

        paddingVertical: 4,

        borderRadius: 20,

      }}
    >

      <Text
        style={{

          color,

          fontWeight: '700',

          fontSize: 12,

        }}
      >

        {label}

      </Text>

    </View>

  );

}
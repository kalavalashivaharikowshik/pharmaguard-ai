import {
  TouchableOpacity,
  Text,
} from 'react-native';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import { COLORS } from '../../utils/theme';

interface Props {

  title: string;

  icon: keyof typeof MaterialIcons.glyphMap;

  onPress(): void;

}

export default function ProfileActionCard({

  title,

  icon,

  onPress,

}: Props) {

  return (

    <TouchableOpacity

      onPress={onPress}

      style={{

        backgroundColor: 'white',

        padding: 18,

        borderRadius: 16,

        marginBottom: 15,

        flexDirection: 'row',

        alignItems: 'center',

      }}

    >

      <MaterialIcons

        name={icon}

        size={24}

        color={COLORS.primary}

      />

      <Text
        style={{
            flex: 1,
            marginLeft: 15,
            fontSize: 16,
            fontWeight: '600',
        }}
        >
        {title}
        </Text>

        <MaterialIcons
        name="chevron-right"
        size={24}
        color={COLORS.subtitle}
        />

    </TouchableOpacity>

  );

}
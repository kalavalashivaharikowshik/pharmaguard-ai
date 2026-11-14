import {
  TouchableOpacity,
} from 'react-native';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import { COLORS } from '../../utils/theme';

interface Props {

  onPress(): void;

}

export default function ScannerButton({

  onPress,

}: Props) {

  return (

    <TouchableOpacity

      onPress={onPress}

      style={{

        position: 'absolute',

        bottom: 50,

        alignSelf: 'center',

        width: 80,

        height: 80,

        borderRadius: 40,

        backgroundColor: COLORS.primary,

        justifyContent: 'center',

        alignItems: 'center',

      }}

    >

      <MaterialIcons

        name="qr-code-scanner"

        size={38}

        color="white"

      />

    </TouchableOpacity>

  );

}
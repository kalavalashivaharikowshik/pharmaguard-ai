import {
  View,
  Text,
} from 'react-native';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import {
  useNetwork,
} from '../../context/NetworkContext';

import {
  COLORS,
} from '../../utils/theme';

export default function OfflineBanner() {

  const {

    isConnected,

  } = useNetwork();

  if (isConnected) {

    return null;

  }

  return (

    <View
      style={{
        backgroundColor: COLORS.danger,
        paddingVertical: 10,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >

      <MaterialIcons
        name="wifi-off"
        size={20}
        color="white"
      />

      <Text
        style={{
          color: 'white',
          fontWeight: '600',
          marginLeft: 8,
        }}
      >
        No Internet Connection
      </Text>

    </View>

  );

}
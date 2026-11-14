import {
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import {
  COLORS,
} from '../../utils/theme';

interface Props {

  title?: string;

  subtitle?: string;

}

export default function LoadingScreen({

  title = 'Loading...',

  subtitle = 'Please wait.',

}: Props) {

  return (

    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}
    >

      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: '#ECFDF5',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >

        <MaterialIcons
          name="local-pharmacy"
          size={42}
          color={COLORS.primary}
        />

      </View>

      <ActivityIndicator
        size="large"
        color={COLORS.primary}
      />

      <Text
        style={{
          marginTop: 20,
          fontSize: 22,
          fontWeight: '700',
          color: COLORS.text,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          marginTop: 8,
          color: COLORS.subtitle,
          textAlign: 'center',
        }}
      >
        {subtitle}
      </Text>

    </SafeAreaView>

  );

}
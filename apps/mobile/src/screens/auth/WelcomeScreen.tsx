import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import Constants from 'expo-constants';

import {
  COLORS,
} from '../../utils/theme';

interface Props {

  onContinue(): void;

}

export default function WelcomeScreen({

  onContinue,

}: Props) {

  return (

    <SafeAreaView
      style={styles.container}
    >

      <View style={styles.content}>

        <View style={styles.logoCircle}>

          <MaterialIcons
            name="local-pharmacy"
            size={60}
            color="white"
          />

        </View>

        <Text style={styles.title}>
          PharmaGuard AI
        </Text>

        <Text style={styles.subtitle}>
          Enterprise Pharmaceutical Safety Platform
        </Text>

        <View style={styles.card}>

          <View style={styles.feature}>

            <MaterialIcons
              name="verified-user"
              size={24}
              color={COLORS.primary}
            />

            <Text style={styles.featureText}>
              Verify medicine authenticity
            </Text>

          </View>

          <View style={styles.feature}>

            <MaterialIcons
              name="hub"
              size={24}
              color={COLORS.primary}
            />

            <Text style={styles.featureText}>
              Blockchain supply chain tracking
            </Text>

          </View>

          <View style={styles.feature}>

            <MaterialIcons
              name="psychology"
              size={24}
              color={COLORS.primary}
            />

            <Text style={styles.featureText}>
              AI-powered recall intelligence
            </Text>

          </View>

        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={onContinue}
        >

          <Text style={styles.buttonText}>
            Get Started
          </Text>

        </TouchableOpacity>

        <Text style={styles.admin}>
          Contact your system administrator
        </Text>

      </View>

      <View style={styles.footer}>

        <Text style={styles.version}>
          Version {Constants.expoConfig?.version}
        </Text>

      </View>

    </SafeAreaView>

  );

}

const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: COLORS.primary,

    justifyContent: 'space-between',

    padding: 24,

  },

  content: {

    flex: 1,

    justifyContent: 'center',

    alignItems: 'center',

  },

  logoCircle: {

    width: 120,

    height: 120,

    borderRadius: 60,

    backgroundColor: 'rgba(255,255,255,0.15)',

    justifyContent: 'center',

    alignItems: 'center',

    marginBottom: 30,

  },

  title: {

    fontSize: 34,

    fontWeight: '700',

    color: 'white',

  },

  subtitle: {

    color: 'white',

    opacity: 0.9,

    marginTop: 10,

    fontSize: 16,

    textAlign: 'center',

    marginBottom: 35,

  },

  card: {

    width: '100%',

    backgroundColor: 'white',

    borderRadius: 22,

    padding: 24,

  },

  feature: {

    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 22,

  },

  featureText: {

    marginLeft: 16,

    fontSize: 16,

    color: COLORS.text,

    fontWeight: '600',

  },

  button: {

    width: '100%',

    marginTop: 35,

    backgroundColor: '#FACC15',

    padding: 18,

    borderRadius: 16,

    alignItems: 'center',

  },

  buttonText: {

    fontSize: 18,

    fontWeight: '700',

    color: '#111827',

  },

  admin: {

    marginTop: 20,

    color: 'white',

    opacity: 0.9,

  },

  footer: {

    alignItems: 'center',

  },

  version: {

    color: 'white',

    opacity: 0.75,

  },

});
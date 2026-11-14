import {
  useState,
  useCallback,
  useMemo,
} from 'react';

import CheckBox from 'expo-checkbox';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

import Toast from 'react-native-toast-message';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import { COLORS } from '../../utils/theme';

interface Props {
  onLogin: (
    email: string,
    password: string,
    remember: boolean,
  ) => void;

  onForgotPassword: () => void;

  loading: boolean;
}

export default function LoginScreen({
  onLogin,
  onForgotPassword,
  loading,
}: Props) {

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    remember,
    setRemember,
  ] = useState(true);

  const isDisabled = useMemo(() => {

    return (

      loading ||

      !email ||

      !password

    );

  }, [

    loading,

    email,

    password,

  ]);

  const submit = useCallback(() => {

    if (
      !email ||
      !password
    ) {

      Toast.show({

        type: 'error',

        text1: 'Missing Information',

        text2: 'Enter email and password.',

      });

      return;

    }

    onLogin(
      email.trim(),
      password,
      remember,
    );

  }, [
    email,
    password,
    remember,
    onLogin,
  ]);

  return (

    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
      }}
    >

      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
        style={styles.container}
      >

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          <View style={styles.card}>

            <View style={styles.logoContainer}>

              <View style={styles.iconCircle}>

                <MaterialIcons
                  name="local-pharmacy"
                  size={46}
                  color={COLORS.primary}
                />

              </View>

            </View>

            <Text style={styles.logo}>
              PharmaGuard AI
            </Text>

            <Text style={styles.subtitle}>
              Pharmaceutical Safety Platform
            </Text>

            <TextInput
              placeholder="Email"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <View style={styles.passwordBox}>

              <TextInput
                placeholder="Password"
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity
                onPress={() =>
                  setShowPassword(!showPassword)
                }
              >

                <MaterialIcons
                  name={
                    showPassword
                      ? 'visibility'
                      : 'visibility-off'
                  }
                  size={24}
                  color="#888"
                />

              </TouchableOpacity>

            </View>

            <View style={styles.rememberRow}>

              <CheckBox
                value={remember}
                onValueChange={setRemember}
              />

              <Text style={styles.rememberText}>
                Remember Me
              </Text>

            </View>
                        <TouchableOpacity
              style={[
                styles.button,
                {
                  opacity: isDisabled ? 0.5 : 1,
                },
              ]}
              onPress={submit}
              disabled={isDisabled}
            >

              {

                loading

                  ? (

                    <ActivityIndicator
                      color="white"
                    />

                  )

                  : (

                    <Text
                      style={styles.buttonText}
                    >
                      Login
                    </Text>

                  )

              }

            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotButton}
              onPress={onForgotPassword}
            >

              <Text
                style={styles.forgotText}
              >
                Forgot Password?
              </Text>

            </TouchableOpacity>

            <Text
              style={styles.needAccount}
            >
              Need an account?
            </Text>

            <Text
              style={styles.contactAdmin}
            >
              Contact your system administrator.
            </Text>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

      <Toast />

    </SafeAreaView>

  );

}

const styles = StyleSheet.create({

  container: {

    flex: 1,

    justifyContent: 'center',

    backgroundColor: COLORS.background,

    padding: 24,

  },

  scrollContent: {

    flexGrow: 1,

    justifyContent: 'center',

  },

  card: {

    backgroundColor: COLORS.white,

    padding: 24,

    borderRadius: 20,

    elevation: 5,

  },

  logoContainer: {

    alignItems: 'center',

    marginBottom: 20,

  },

  iconCircle: {

    width: 90,

    height: 90,

    borderRadius: 45,

    backgroundColor: '#ECFDF5',

    justifyContent: 'center',

    alignItems: 'center',

  },

  logo: {

    fontSize: 30,

    fontWeight: '700',

    color: COLORS.primary,

    textAlign: 'center',

  },

  subtitle: {

    color: COLORS.subtitle,

    marginBottom: 25,

    marginTop: 5,

    textAlign: 'center',

  },

  input: {

    borderWidth: 1,

    borderColor: COLORS.border,

    borderRadius: 12,

    padding: 15,

    marginBottom: 15,

  },

  passwordBox: {

    flexDirection: 'row',

    alignItems: 'center',

    borderWidth: 1,

    borderColor: COLORS.border,

    borderRadius: 12,

    paddingHorizontal: 15,

    marginBottom: 15,

  },

  passwordInput: {

    flex: 1,

    paddingVertical: 15,

  },

  rememberRow: {

    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 20,

  },

  rememberText: {

    marginLeft: 10,

    color: COLORS.subtitle,

  },

  button: {

    backgroundColor: COLORS.primary,

    padding: 16,

    borderRadius: 14,

    alignItems: 'center',

  },

  buttonText: {

    color: 'white',

    fontWeight: '700',

    fontSize: 16,

  },

  forgotButton: {

    marginTop: 18,

    alignItems: 'center',

  },

  forgotText: {

    color: COLORS.secondary,

    fontWeight: '600',

  },

  needAccount: {

    marginTop: 40,

    textAlign: 'center',

    color: COLORS.subtitle,

  },

  contactAdmin: {

    marginTop: 6,

    textAlign: 'center',

    color: COLORS.primary,

    fontWeight: '600',

  },

});
import { useState } from 'react';

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

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import Toast from 'react-native-toast-message';

import PageHeader from '../../components/common/PageHeader';

import { COLORS } from '../../utils/theme';
import { authService } from '../../services/authService';

export default function ResetPasswordScreen() {

  const [
    token,
    setToken,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(false);

  async function submit() {

    if (
      !token ||
      !password ||
      !confirmPassword
    ) {

      Toast.show({
        type: 'error',
        text1: 'Complete all fields',
      });

      return;

    }

    if (
      password !==
      confirmPassword
    ) {

      Toast.show({
        type: 'error',
        text1: 'Passwords do not match',
      });

      return;

    }

    try {

      setLoading(true);

      await authService.resetPassword({

        token,

        password,

      });

      Toast.show({

        type: 'success',

        text1: 'Password Updated',

        });

        setToken('');
        setPassword('');
        setConfirmPassword('');

    }

    catch {

      Toast.show({

        type: 'error',

        text1: 'Reset Failed',

      });

    }

    finally {

      setLoading(false);

    }

  }

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
            contentContainerStyle={{
                paddingBottom:30,
            }}
            >

            <PageHeader
                title="Reset Password"
                subtitle="Create a new password using your reset token"
                />

        <View
          style={{
            alignItems: 'center',
            marginBottom: 24,
          }}
        >

          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: '#ECFDF5',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >

            <MaterialIcons
              name="lock-reset"
              size={46}
              color={COLORS.primary}
            />

          </View>

        </View>

        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 20,
            elevation: 3,
          }}
        >

          <Text
            style={{
              fontWeight: '700',
              marginBottom: 8,
            }}
          >
            Reset Token
          </Text>

          <TextInput
            placeholder="Reset Token"
            value={token}
            onChangeText={setToken}
            style={{
              backgroundColor: 'white',
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: 16,
              borderRadius: 14,
              fontSize: 16,
              marginBottom: 20,
            }}
          />

          <Text
            style={{
              fontWeight: '700',
              marginBottom: 8,
            }}
          >
            New Password
          </Text>

          <TextInput
            placeholder="New Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={{
              backgroundColor: 'white',
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: 16,
              borderRadius: 14,
              fontSize: 16,
              marginBottom: 20,
            }}
          />

          <Text
            style={{
              fontWeight: '700',
              marginBottom: 8,
            }}
          >
            Confirm Password
          </Text>

          <TextInput
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={{
              backgroundColor: 'white',
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: 16,
              borderRadius: 14,
              fontSize: 16,
              marginBottom: 20,
            }}
          />

          <TouchableOpacity
            onPress={submit}
            disabled={
              loading ||
              !token ||
              !password ||
              !confirmPassword
            }
            style={[
              styles.button,
              {
                paddingVertical: 18,
                borderRadius: 14,
                elevation: 3,
                opacity:
                  loading ||
                  !token ||
                  !password ||
                  !confirmPassword
                    ? 0.5
                    : 1,
              },
            ]}
          >

            {
              loading

                ?

                <ActivityIndicator
                  color="white"
                />

                :

                <Text
                  style={styles.buttonText}
                >
                  Reset Password
                </Text>

            }

          </TouchableOpacity>

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

    padding: 20,

    backgroundColor: COLORS.background,

  },

  button: {

    backgroundColor: COLORS.primary,

    alignItems: 'center',

  },

  buttonText: {

    color: COLORS.white,

    fontWeight: '700',

    fontSize: 16,

  },

});
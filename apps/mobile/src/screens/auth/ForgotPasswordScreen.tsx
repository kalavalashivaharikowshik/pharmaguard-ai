import {
  useState,
  useCallback,
  useMemo,
} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import Toast from 'react-native-toast-message';

import PageHeader from '../../components/common/PageHeader';

import { authService } from '../../services/authService';

import { COLORS } from '../../utils/theme';


interface Props {

  onBack(): void;

}


export default function ForgotPasswordScreen({

  onBack,

}: Props) {


  const [

    email,

    setEmail,

  ] = useState('');


  const [

    loading,

    setLoading,

  ] = useState(false);



  const isDisabled = useMemo(() => {

    return (

      loading ||

      !email.trim()

    );

  }, [

    loading,

    email,

  ]);



  const submit = useCallback(async () => {


    if (!email.trim()) {


      Toast.show({

        type: 'error',

        text1: 'Email Required',

      });


      return;

    }



    try {


      setLoading(true);



      await authService.forgotPassword({

        email,

      });



      setEmail('');



      Toast.show({

        type: 'success',

        text1: 'Reset Email Sent',

        text2: 'Check your inbox.',

      });



      setTimeout(() => {

        onBack();

      }, 1500);



    }

    catch {


      Toast.show({

        type: 'error',

        text1: 'Request Failed',

      });


    }

    finally {


      setLoading(false);


    }


  }, [

    email,

    onBack,

  ]);



  return (

    <SafeAreaView

      style={styles.safeArea}

    >


      <KeyboardAvoidingView

        behavior={

          Platform.OS === 'ios'

            ? 'padding'

            : undefined

        }

        style={styles.container}

      >


        <PageHeader
            title="Forgot Password"
            subtitle="Enter your email to receive a password reset link."
            onBack={onBack}
            />



        <View

          style={styles.iconContainer}

        >


          <View

            style={styles.iconCircle}

          >


            <MaterialIcons

              name="mail"

              size={46}

              color={COLORS.primary}

            />


          </View>


        </View>



        <View

          style={styles.card}

        >


          <Text

            style={styles.label}

          >

            Email Address

          </Text>
                    <TextInput

            placeholder="Email"

            value={email}

            onChangeText={setEmail}

            autoCapitalize="none"

            keyboardType="email-address"

            style={styles.input}

          />



          <TouchableOpacity


            onPress={submit}


            disabled={isDisabled}


            style={[

              styles.button,

              {

                opacity: isDisabled

                  ? 0.5

                  : 1,

              },

            ]}


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

                    Send Reset Link

                  </Text>

                )

            }


          </TouchableOpacity>




          <TouchableOpacity


            onPress={onBack}


            disabled={loading}


            style={[

              styles.backButton,

              {

                opacity: loading

                  ? 0.5

                  : 1,

              },

            ]}


          >


            <Text

              style={styles.backText}

            >

              ← Back to Login

            </Text>


          </TouchableOpacity>


        </View>


      </KeyboardAvoidingView>


    </SafeAreaView>


  );


}



const styles = StyleSheet.create({


  safeArea: {

    flex: 1,

    backgroundColor: COLORS.background,

  },


  container: {

    flex: 1,

  },


  iconContainer: {

    alignItems: 'center',

    marginBottom: 24,

  },


  iconCircle: {

    width: 90,

    height: 90,

    borderRadius: 45,

    backgroundColor: '#ECFDF5',

    justifyContent: 'center',

    alignItems: 'center',

  },


  card: {

    backgroundColor: 'white',

    borderRadius: 20,

    padding: 20,

    marginHorizontal: 20,

    elevation: 3,

  },


  label: {

    fontWeight: '700',

    marginBottom: 8,

    fontSize: 15,

  },


  input: {

    backgroundColor: 'white',

    borderWidth: 1,

    borderColor: COLORS.border,

    padding: 16,

    borderRadius: 14,

    fontSize: 16,

    marginBottom: 20,

  },


  button: {

    backgroundColor: COLORS.primary,

    padding: 16,

    borderRadius: 14,

    alignItems: 'center',

    justifyContent: 'center',

  },


  buttonText: {

    color: 'white',

    fontWeight: '700',

    fontSize: 16,

  },


  backButton: {

    marginTop: 20,

    alignItems: 'center',

  },


  backText: {

    color: COLORS.primary,

    fontWeight: '600',

    fontSize: 16,

  },


});
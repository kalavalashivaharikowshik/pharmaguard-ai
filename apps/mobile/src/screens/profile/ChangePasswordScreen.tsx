import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  View,
  StyleSheet,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useState,
  useCallback,
  useMemo,
} from 'react';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import {
  useNavigation,
} from '@react-navigation/native';

import Toast from 'react-native-toast-message';

import { userService } from '../../services/userService';

import PageHeader from '../../components/common/PageHeader';

import { COLORS } from '../../utils/theme';



export default function ChangePasswordScreen() {


  const navigation =
    useNavigation<any>();



  const [

    currentPassword,

    setCurrentPassword,

  ] = useState('');



  const [

    newPassword,

    setNewPassword,

  ] = useState('');



  const [

    confirmPassword,

    setConfirmPassword,

  ] = useState('');



  const [

    loading,

    setLoading,

  ] = useState(false);



  const isDisabled = useMemo(() => {

    return (

      loading ||

      !currentPassword ||

      !newPassword ||

      !confirmPassword

    );

  }, [

    loading,

    currentPassword,

    newPassword,

    confirmPassword,

  ]);



  const changePassword = useCallback(async () => {


    if (

      !currentPassword ||

      !newPassword ||

      !confirmPassword

    ) {


      Toast.show({

        type:'error',

        text1:'All fields are required',

      });


      return;

    }



    if (

      newPassword !== confirmPassword

    ) {


      Toast.show({

        type:'error',

        text1:'Passwords do not match',

      });


      return;

    }



    if (

      newPassword.length < 8

    ) {


      Toast.show({

        type:'error',

        text1:'Minimum 8 characters',

      });


      return;

    }



    try {


      setLoading(true);



      await userService.changePassword({

        currentPassword,

        newPassword,

      });



      Toast.show({

        type:'success',

        text1:'Password Updated',

      });



      navigation.goBack();



    }

    catch(error:any) {


      Toast.show({

        type:'error',

        text1:'Unable to change password',

        text2:

          error?.response?.data?.message ??

          '',

      });


    }

    finally {


      setLoading(false);


    }


  }, [

    currentPassword,

    newPassword,

    confirmPassword,

    navigation,

  ]);



  return (

    <SafeAreaView

      style={styles.safeArea}

    >

      <ScrollView

        contentContainerStyle={styles.content}

      >


        <PageHeader

          title="Change Password"

          subtitle="Update your account password securely"
          onBack={() => navigation.goBack()}

        />



        <View

          style={styles.iconContainer}

        >


          <View

            style={styles.iconCircle}

          >


            <MaterialIcons

              name="lock"

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

            Current Password

          </Text>



          <TextInput

            placeholder="Current Password"

            secureTextEntry

            value={currentPassword}

            onChangeText={setCurrentPassword}

            style={styles.input}

          />
                    <Text

            style={styles.label}

          >

            New Password

          </Text>



          <TextInput

            placeholder="New Password"

            secureTextEntry

            value={newPassword}

            onChangeText={setNewPassword}

            style={styles.input}

          />



          <Text

            style={styles.label}

          >

            Confirm Password

          </Text>



          <TextInput

            placeholder="Confirm Password"

            secureTextEntry

            value={confirmPassword}

            onChangeText={setConfirmPassword}

            style={styles.input}

          />



          <TouchableOpacity


            onPress={changePassword}


            disabled={isDisabled}


            style={[

              styles.button,

              {

                opacity:

                  isDisabled

                    ? 0.5

                    : 1,

              },

            ]}


          >


            {

              loading

                ?

                (

                  <ActivityIndicator

                    color="white"

                  />

                )

                :

                (

                  <Text

                    style={styles.buttonText}

                  >

                    Update Password

                  </Text>

                )

            }


          </TouchableOpacity>



        </View>


      </ScrollView>


    </SafeAreaView>


  );


}



const styles = StyleSheet.create({


  safeArea: {

    flex:1,

    backgroundColor:COLORS.background,

  },


  content: {

    padding:20,

  },


  iconContainer: {

    alignItems:'center',

    marginBottom:24,

  },


  iconCircle: {

    width:90,

    height:90,

    borderRadius:45,

    backgroundColor:'#ECFDF5',

    justifyContent:'center',

    alignItems:'center',

  },


  card: {

    backgroundColor:'white',

    borderRadius:20,

    padding:20,

    elevation:3,

  },


  label: {

    fontWeight:'700',

    marginBottom:8,

  },


  input: {

    backgroundColor:'white',

    borderWidth:1,

    borderColor:COLORS.border,

    padding:16,

    borderRadius:14,

    fontSize:16,

    marginBottom:20,

  },


  button: {

    backgroundColor:COLORS.primary,

    paddingVertical:18,

    borderRadius:14,

    elevation:3,

    alignItems:'center',

  },


  buttonText: {

    color:'white',

    fontWeight:'700',

    fontSize:17,

  },


});
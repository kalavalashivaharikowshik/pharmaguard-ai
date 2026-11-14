import {
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import {
  COLORS,
} from '../../utils/theme';


export default function SplashScreen() {

  return (

    <SafeAreaView

      style={styles.container}

    >


      <MaterialIcons

        name="local-pharmacy"

        size={70}

        color="white"

      />



      <Text

        style={styles.title}

      >

        PharmaGuard AI

      </Text>



      <Text

        style={styles.subtitle}

      >

        Pharmaceutical Safety Platform

      </Text>



      <ActivityIndicator

        size="large"

        color="white"

        style={styles.loader}

      />


    </SafeAreaView>

  );

}



const styles = StyleSheet.create({


  container: {

    flex: 1,

    justifyContent: 'center',

    alignItems: 'center',

    backgroundColor: COLORS.primary,

  },


  title: {

    color: 'white',

    fontSize: 34,

    fontWeight: '700',

    marginTop: 20,

  },


  subtitle: {

    color: 'white',

    marginTop: 10,

    fontSize: 16,

    opacity: 0.9,

  },


  loader: {

    marginTop: 30,

  },


});
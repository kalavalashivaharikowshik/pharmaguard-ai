import {
  View,
  StyleSheet,
} from 'react-native';

import { COLORS } from '../../utils/theme';

export default function ScannerOverlay() {

  return (

    <View
      style={StyleSheet.absoluteFillObject}
      pointerEvents="none"
    >

      <View style={styles.overlay} />

      <View style={styles.middle}>

        <View style={styles.side} />

        <View style={styles.frame} />

        <View style={styles.side} />

      </View>

      <View style={styles.overlay} />

    </View>

  );

}

const styles = StyleSheet.create({

  overlay: {

    flex: 1,

    backgroundColor: 'rgba(0,0,0,0.55)',

  },

  middle: {

    flexDirection: 'row',

    height: 260,

  },

  side: {

    flex: 1,

    backgroundColor: 'rgba(0,0,0,0.55)',

  },

  frame: {

    width: 260,

    borderWidth: 3,

    borderColor: COLORS.primary,

    borderRadius: 20,

  },

});
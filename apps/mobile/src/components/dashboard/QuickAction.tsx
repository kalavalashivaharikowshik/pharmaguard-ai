import {
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import React from 'react';
import {
  MaterialIcons,
} from '@expo/vector-icons';

interface Props {

  icon: keyof typeof MaterialIcons.glyphMap;

  title: string;

  color: string;

  onPress(): void;

}

function QuickAction({

  icon,

  title,

  color,

  onPress,

}: Props) {

  return (

    <TouchableOpacity

      onPress={onPress}

      style={{

        width:'30%',

        backgroundColor:'white',

        borderRadius:18,

        paddingVertical:20,

        alignItems:'center',

        marginBottom:16,

        elevation:3,

      }}

    >

      <View

        style={{

          width:54,

          height:54,

          borderRadius:27,

          backgroundColor:color,

          justifyContent:'center',

          alignItems:'center',

        }}

      >

        <MaterialIcons

          name={icon}

          size={28}

          color="white"

        />

      </View>

      <Text

        style={{

          marginTop:10,

          fontWeight:'600',

          textAlign:'center',

        }}

      >

        {title}

      </Text>

    </TouchableOpacity>

  );

}
export default React.memo(QuickAction);
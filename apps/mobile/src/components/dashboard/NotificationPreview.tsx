import {
  View,
  Text,
} from 'react-native';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import type {
  Notification,
} from '../../types/notification';

import { COLORS } from '../../utils/theme';

interface Props{

  notifications:Notification[];

}

export default function NotificationPreview({

  notifications,

}:Props){

  if(!notifications.length){

    return(

      <View
        style={{
          backgroundColor:COLORS.white,
          padding:18,
          borderRadius:18,
        }}
      >

        <Text
            style={{
                color: COLORS.subtitle,
                textAlign: 'center',
            }}
            >
            No notifications available.
            </Text>

      </View>

    );

  }

  return(

<>

{notifications.map(item=>(

<View

key={item.id}

style={{

backgroundColor:COLORS.white,

padding:18,

borderRadius:18,

marginBottom:12,

}}

>

<Text

style={{

fontWeight:'700',

}}

>

{item.title}

</Text>

<Text

style={{

marginTop:6,

color:COLORS.subtitle,

}}

>

{item.message}

</Text>

</View>

))}

</>

);

}
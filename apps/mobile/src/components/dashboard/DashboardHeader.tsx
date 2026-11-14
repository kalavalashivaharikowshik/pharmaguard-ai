import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {
  MaterialIcons,
} from '@expo/vector-icons';

import {
  useNavigation,
} from '@react-navigation/native';

import { COLORS } from '../../utils/theme';

interface Props {

  name: string;

  role: string;

}

function DashboardHeader({

  name,

  role,

}: Props) {

  const navigation =
    useNavigation<any>();

  const hour =
    new Date().getHours();

  const greeting =

    hour < 12

      ? 'Good Morning'

      : hour < 18

      ? 'Good Afternoon'

      : 'Good Evening';

  const today =
    new Date().toLocaleDateString(

      undefined,

      {

        weekday: 'long',

        month: 'long',

        day: 'numeric',

      },

    );

  return (

    <View
    style={{
        backgroundColor: COLORS.primary,

        borderBottomLeftRadius: 28,

        borderBottomRightRadius: 28,

        paddingHorizontal: 20,

        paddingBottom: 24,

        paddingTop: 20,
    }}
    >

      {/* Header Row */}

      <View

        style={{

          flexDirection: 'row',

          justifyContent: 'space-between',

          alignItems: 'flex-start',

        }}

      >

        <View style={{ flex: 1 }}>

          <Text

            style={{

              color: 'white',

              opacity: 0.9,

            }}

          >

            {today}

          </Text>

          <Text

            style={{

              fontSize: 18,

              color: 'white',

              marginTop: 10,

            }}

          >

            {greeting},

          </Text>

          <Text

            style={{

              fontSize: 28,

              fontWeight: '700',

              color: 'white',

              marginTop: 6,

            }}

          >

            {name}

          </Text>

        </View>

        {/* Right Icons */}

        <View

          style={{

            flexDirection: 'row',

            alignItems: 'center',

          }}

        >

          <TouchableOpacity

            onPress={() =>

              navigation.navigate(

                'Notifications',

              )

            }

          >

            <MaterialIcons

              name="notifications"

              size={28}

              color="white"

            />

          </TouchableOpacity>

          <TouchableOpacity

            onPress={() =>

              navigation.navigate(

                'Profile',

              )

            }

            style={{

              marginLeft: 18,

            }}

          >

            <MaterialIcons

              name="account-circle"

              size={32}

              color="white"

            />

          </TouchableOpacity>

        </View>

      </View>

      {/* Role */}

      <View
        style={{

        flexDirection:'row',

        alignItems:'center',

        marginTop:16,

        paddingBottom:4,

        }}
        >

        <MaterialIcons

          name="verified-user"

          size={18}

          color="#A7F3D0"

        />

        <Text

          style={{

            marginLeft: 8,

            color: '#A7F3D0',

            fontWeight: '600',

          }}

        >

          {role}

        </Text>

      </View>

    </View>

  );

}
export default React.memo(DashboardHeader);
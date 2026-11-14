import {
  View,
  Text,
} from 'react-native';

import { COLORS } from '../../utils/theme';

interface Item {

  id: string;

  name: string;

  batches: number;

}

interface Props {

  data: Item[];

}

export default function ManufacturerStatistics({

  data,

}: Props) {

  return (

    <View
      style={{

        backgroundColor:'white',

        borderRadius:18,

        padding:20,

        marginBottom:20,

        elevation:3,

      }}
    >

      <Text
        style={{

          fontSize:18,

          fontWeight:'700',

          marginBottom:20,

        }}
      >

        Manufacturer Statistics

      </Text>

      {

        data.length === 0

        ?

        (

          <Text
            style={{

              color:COLORS.subtitle,

            }}
          >

            No manufacturer data available.

          </Text>

        )

        :

        data.map(item=>(

          <View

            key={item.id}

            style={{

              marginBottom:16,

            }}

          >

            <View
              style={{

                flexDirection:'row',

                justifyContent:'space-between',

                marginBottom:8,

              }}
            >

              <Text
                style={{

                  fontWeight:'600',

                  flex:1,

                }}
              >

                {item.name}

              </Text>

              <Text
                style={{

                  fontWeight:'700',

                  color:COLORS.primary,

                }}
              >

                {item.batches} batches

              </Text>

            </View>

            <View
              style={{

                height:10,

                borderRadius:8,

                backgroundColor:'#E5E7EB',

                overflow:'hidden',

              }}
            >

              <View
                style={{

                  height:10,

                  width:`${Math.min(item.batches*10,100)}%`,

                  backgroundColor:COLORS.primary,

                }}
              />

            </View>

          </View>

        ))

      }

    </View>

  );

}
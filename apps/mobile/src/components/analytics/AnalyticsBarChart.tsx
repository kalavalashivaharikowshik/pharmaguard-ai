import {
  View,
  Text,
} from 'react-native';

import { COLORS } from '../../utils/theme';

interface Item {

  month: number;

  value: number;

}

interface Props {

  title: string;

  data: Item[];

  color: string;

}

const MONTHS = [

  'Jan',

  'Feb',

  'Mar',

  'Apr',

  'May',

  'Jun',

  'Jul',

  'Aug',

  'Sep',

  'Oct',

  'Nov',

  'Dec',

];

export default function AnalyticsBarChart({

  title,

  data,

  color,

}: Props) {

  const max =

    Math.max(

      ...data.map(

        item => item.value,

      ),

      1,

    );

  return (

    <View
      style={{

        backgroundColor: 'white',

        borderRadius: 18,

        padding: 18,

        marginBottom: 20,

        elevation: 3,

      }}
    >

      <Text
        style={{

          fontSize: 18,

          fontWeight: '700',

          marginBottom: 20,

        }}
      >

        {title}

      </Text>

      <View
        style={{

          flexDirection: 'row',

          alignItems: 'flex-end',

          justifyContent: 'space-between',

          height: 180,

        }}
      >

        {

          data.map(item => {

            const height =

              (item.value / max) * 130;

            return (

              <View

                key={item.month}

                style={{

                  alignItems: 'center',

                  flex: 1,

                }}

              >

                <Text
                  style={{

                    fontSize: 10,

                    marginBottom: 4,

                  }}
                >

                  {item.value}

                </Text>

                <View
                  style={{

                    width: 14,

                    height,

                    backgroundColor: color,

                    borderRadius: 8,

                  }}
                />

                <Text
                  style={{

                    marginTop: 8,

                    fontSize: 10,

                    color: COLORS.subtitle,

                  }}
                >

                  {MONTHS[item.month - 1]}

                </Text>

              </View>

            );

          })

        }

      </View>

    </View>

  );

}
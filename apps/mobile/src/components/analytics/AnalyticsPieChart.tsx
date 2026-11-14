import {
  View,
  Text,
} from 'react-native';

import { COLORS } from '../../utils/theme';

interface Props {

  title: string;

  data: {

    LOW: number;

    MEDIUM: number;

    HIGH: number;

    CRITICAL: number;

  };

}

export default function AnalyticsPieChart({

  title,

  data,

}: Props) {

  const total =

    data.LOW +

    data.MEDIUM +

    data.HIGH +

    data.CRITICAL;

  const rows = [

    {

      label: 'Critical',

      value: data.CRITICAL,

      color: '#DC2626',

    },

    {

      label: 'High',

      value: data.HIGH,

      color: '#F59E0B',

    },

    {

      label: 'Medium',

      value: data.MEDIUM,

      color: '#3B82F6',

    },

    {

      label: 'Low',

      value: data.LOW,

      color: '#10B981',

    },

  ];

  return (

    <View
      style={{

        backgroundColor: 'white',

        borderRadius: 18,

        padding: 20,

        elevation: 3,

        marginBottom: 20,

      }}
    >

      <Text
        style={{

          fontWeight: '700',

          fontSize: 18,

          marginBottom: 20,

        }}
      >

        {title}

      </Text>

      {

        rows.map(item => (

          <View

            key={item.label}

            style={{

              flexDirection: 'row',

              justifyContent: 'space-between',

              alignItems: 'center',

              marginBottom: 16,

            }}

          >

            <View
              style={{

                flexDirection: 'row',

                alignItems: 'center',

              }}
            >

              <View
                style={{

                  width: 14,

                  height: 14,

                  borderRadius: 7,

                  backgroundColor: item.color,

                  marginRight: 10,

                }}
              />

              <Text>

                {item.label}

              </Text>

            </View>

            <Text
              style={{

                fontWeight: '700',

                color: COLORS.primary,

              }}
            >

              {item.value}

              {' ('}

              {

                total === 0

                  ? 0

                  : Math.round(

                      (item.value / total) * 100,

                    )

              }

              %)

            </Text>

          </View>

        ))

      }

    </View>

  );

}
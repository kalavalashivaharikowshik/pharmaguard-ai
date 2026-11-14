import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import type {

  ScanHistory,

} from '../../types/scanHistory';

import StatusBadge from '../common/StatusBadge';

import { COLORS } from '../../utils/theme';

interface Props {

  item: ScanHistory;

  onPress(): void;

}

export default function ScanHistoryCard({

  item,

  onPress,

}: Props) {

  const success = item.verified;

  return (

    <TouchableOpacity

      onPress={onPress}

      style={{

        backgroundColor:'white',

        borderRadius:18,

        padding:18,

        marginBottom:16,

        elevation:2,

      }}

    >

      <View
        style={{

          flexDirection:'row',

          justifyContent:'space-between',

          alignItems:'center',

        }}

      >

        <View
          style={{ flex:1 }}
        >

          <Text
            style={{

              fontSize:17,

              fontWeight:'700',

            }}

          >

            {item.batch?.drugName ??

            item.batchNumber}

          </Text>

          <Text
            style={{

              color:COLORS.subtitle,

              marginTop:4,

            }}

          >

            {item.batchNumber}

          </Text>

        </View>

        <MaterialIcons

          name={

            success

            ? 'verified'

            : 'error'

          }

          size={30}

          color={

            success

            ? COLORS.success

            : COLORS.danger

          }

        />

      </View>

      <View
        style={{

          marginTop:16,

        }}

      >

        <StatusBadge

          label={item.result}

          color={

            success

            ? COLORS.success

            : COLORS.danger

          }

        />

      </View>

      <Text
        style={{

          marginTop:14,

          color:COLORS.subtitle,

          fontSize:13,

        }}

      >

        {

          new Date(

            item.scannedAt,

          ).toLocaleString()

        }

      </Text>

    </TouchableOpacity>

  );

}   
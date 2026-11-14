import {
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import React from 'react';
import {
  MaterialIcons,
} from '@expo/vector-icons';

import type {
  Transfer,
} from '../../types/transfer';

import {
  COLORS,
} from '../../utils/theme';

import TransferStatusChip from './TransferStatusChip';

interface Props {
  item: Transfer;
  onPress(): void;
}

function TransferCard({
  item,
  onPress,
}: Props) {

  const formattedDate = new Date(
    item.createdAt,
  ).toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (

    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: 'white',
        borderRadius: 18,
        padding: 18,
        marginBottom: 16,
        elevation: 3,
      }}
    >

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >

        <View style={{ flex: 1 }}>

          <Text
            style={{
              fontSize: 19,
              fontWeight: '700',
            }}
          >
            {item.batch.drugName}
          </Text>

          <Text
            style={{
              color: COLORS.subtitle,
              fontSize: 13,
            }}
          >
            Batch Number
          </Text>

          <Text
            style={{
              fontWeight: '700',
              marginTop: 4,
            }}
          >
            {item.batch.batchNumber}
          </Text>

        </View>

        <MaterialIcons
          name="local-shipping"
          size={32}
          color={COLORS.primary}
        />

      </View>

      {/* Quantity */}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >

        <MaterialIcons
          name="inventory-2"
          size={20}
          color={COLORS.primary}
        />

        <Text
          style={{
            marginLeft: 10,
          }}
        >
          Quantity: {item.quantity} Units
        </Text>

      </View>

      {/* Sender */}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >

        <MaterialIcons
          name="person"
          size={20}
          color={COLORS.primary}
        />

        <Text
          style={{
            marginLeft: 10,
          }}
        >
          From: {item.fromUser?.fullName ?? '-'}
        </Text>

      </View>

      {/* Receiver */}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >

        <MaterialIcons
          name="person-outline"
          size={20}
          color={COLORS.primary}
        />

        <Text
          style={{
            marginLeft: 10,
          }}
        >
          To: {item.toUser?.fullName ?? '-'}
        </Text>

      </View>

      {/* Footer */}

      <View
        style={{
          marginTop: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >

        <TransferStatusChip
          status={item.status}
        />

        <Text
          style={{
            fontSize: 12,
            color: COLORS.subtitle,
          }}
        >
          {formattedDate}
        </Text>

      </View>

    </TouchableOpacity>

  );

}
export default React.memo(TransferCard);
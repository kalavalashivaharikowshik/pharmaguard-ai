import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import SeverityBadge from './SeverityBadge';
import RecallStatusBadge from './RecallStatusBadge';

import { COLORS } from '../../utils/theme';

import type { Recall } from '../../types/recall';

interface Props {

  recall: Recall;

  onPress(): void;

}

function RecallCard({

  recall,

  onPress,

}: Props) {

  return (

    <TouchableOpacity

      onPress={onPress}

      style={{

        backgroundColor: 'white',

        borderRadius: 18,

        padding: 18,

        marginBottom: 15,
        elevation: 3,

      }}

    >

      <Text

        style={{

          fontSize: 18,

          fontWeight: '700',

        }}

      >

        {recall.batch.drugName}

      </Text>

      <Text

        style={{

          marginTop: 6,

          color: COLORS.subtitle,

        }}

      >

        {recall.recallNumber}

      </Text>

      <Text
        style={{
            marginTop: 10,
            color: COLORS.subtitle,
            fontSize: 13,
        }}
        >
        Reason
        </Text>

        <Text
        style={{
            fontWeight: '700',
            marginTop: 4,
        }}
        >
        {recall.reason}
        </Text>

      <View

        style={{

          flexDirection: 'row',

          justifyContent: 'space-between',

          marginTop: 16,

        }}

      >

        <SeverityBadge

          severity={recall.severity}

        />

        <RecallStatusBadge

          status={recall.status}

        />

      </View>

    </TouchableOpacity>

  );

}
export default React.memo(RecallCard);
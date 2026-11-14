import {
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import React from 'react';
import NotificationBadge from './NotificationBadge';

import { COLORS } from '../../utils/theme';
import type { Notification } from '../../types/notification';

interface Props {

  notification: Notification;

  onPress(): void;

}

function NotificationCard({

  notification,

  onPress,

}: Props) {

  return (

    <TouchableOpacity

      onPress={onPress}

      style={{

        backgroundColor: 'white',

        padding: 18,

        borderRadius: 16,

        marginBottom: 15,

        borderLeftWidth: 5,

        elevation:3,

        borderLeftColor:

          notification.isRead

            ? COLORS.border

            : COLORS.primary,

      }}

    >

      <Text

        style={{

          fontSize: 18,

          fontWeight: '700',

        }}

      >

        {notification.title}

      </Text>

      <Text

        style={{

          marginTop: 8,

          color: COLORS.subtitle,

        }}

        numberOfLines={2}

      >

        {notification.message}

      </Text>

      <View

        style={{

          flexDirection: 'row',

          justifyContent: 'space-between',

          alignItems: 'center',

          marginTop: 18,

        }}

      >

        <NotificationBadge

          priority={notification.priority}

        />

        <Text

          style={{

            color: COLORS.subtitle,

            fontSize: 12,

          }}

        >

          {

            new Date(notification.createdAt).toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })

          }

        </Text>

      </View>

    </TouchableOpacity>

  );

}
export default React.memo(NotificationCard);
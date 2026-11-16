import {
  getMessaging,
  getToken,
  requestPermission,
  AuthorizationStatus,
  onTokenRefresh,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
} from '@react-native-firebase/messaging';

import { PermissionsAndroid, Platform } from 'react-native';

import Toast from 'react-native-toast-message';

import { api } from './api';
import { notificationEvents } from '../utils/notificationEvents';

const messaging = getMessaging();

let foregroundSubscribed = false;
let tokenSubscribed = false;
let notificationOpenSubscribed = false;

export const firebaseMessagingService = {

  async registerDevice() {

    try {

      // Android 13+ only shows notifications after the user allows them.
      if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          return;
        }
      }

      const permission =

        await requestPermission(
          messaging,
        );

      const granted =

        permission ===
          AuthorizationStatus.AUTHORIZED ||

        permission ===
          AuthorizationStatus.PROVISIONAL;

      if (!granted) {

        return;

      }

      const token =
        await getToken(messaging);

      console.log(
        'FCM Token:',
        token,
      );

      await api.post(
        '/device-tokens/register',
        {
          token,
          platform: Platform.OS,
          deviceName: Platform.OS,
        },
      );

    }

    catch (error) {

      console.log(
        'FCM Registration Error',
        error,
      );

    }

  },

  listenTokenRefresh() {

    if (tokenSubscribed) {

      return;

    }

    tokenSubscribed = true;

    onTokenRefresh(

      messaging,

      async token => {

        try {

          await api.post(
            '/device-tokens/register',
            {
              token,
              platform: Platform.OS,
              deviceName: Platform.OS,
            },
          );

        }

        catch (error) {

          console.log(
            'Token Refresh Error',
            error,
          );

        }

      },

    );

  },

  listenForegroundMessages() {

    if (foregroundSubscribed) {

      return;

    }

    foregroundSubscribed = true;

    onMessage(

      messaging,

      async remoteMessage => {

        Toast.show({

          type: 'success',

          text1:

            remoteMessage.notification?.title ??

            'Notification',

          text2:

            remoteMessage.notification?.body ??

            '',

        });

        notificationEvents.emit();

      },

    );

  },

  listenNotificationOpened(
    navigation: any,
  ) {

    if (notificationOpenSubscribed) {

      return;

    }

    notificationOpenSubscribed = true;

    onNotificationOpenedApp(

      messaging,

      remoteMessage => {

        const action =

          remoteMessage.data?.actionUrl;

        if (

          typeof action === 'string'

        ) {

          this.navigate(

            navigation,

            action,

          );

        }

      },

    );

  },

  async handleInitialNotification(
    navigation: any,
  ) {

    const remoteMessage =

      await getInitialNotification(
        messaging,
      );

    if (!remoteMessage) {

      return;

    }

    const action =

      remoteMessage.data?.actionUrl;

    if (

      typeof action === 'string'

    ) {

      this.navigate(

        navigation,

        action,

      );

    }

  },

  navigate(
    navigation: any,
    actionUrl?: string,
  ) {

    if (!actionUrl) {

      return;

    }

    switch (actionUrl) {

      case '/inventory':

        navigation.navigate(
          'Inventory',
        );

        break;

      case '/transfers':

        navigation.navigate(
          'Transfers',
        );

        break;

      case '/recalls':

        navigation.navigate(
          'Recalls',
        );

        break;

      case '/notifications':

        navigation.navigate(
          'Notifications',
        );

        break;

      case '/settings':

        navigation.navigate(
          'Profile',
        );

        break;

      default:

        break;

    }

  },

};
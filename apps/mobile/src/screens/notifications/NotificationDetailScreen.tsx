import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useEffect,
  useState,
  useCallback
} from 'react';

import {
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import {
  Notification,
  NotificationPriority,
} from '../../types/notification';

import Toast from 'react-native-toast-message';

import PageHeader from '../../components/common/PageHeader';

import LoadingScreen from '../../components/common/LoadingScreen';

import NotificationBadge from '../../components/notifications/NotificationBadge';

import { notificationService } from '../../services/notificationService';

import { COLORS } from '../../utils/theme';

export default function NotificationDetailsScreen() {

  const navigation =
    useNavigation<any>();

  const route =
    useRoute<any>();

  const { id } =
    route.params;

  const [

    notification,

    setNotification,

  ] = useState<Notification>();

  const [

    loading,

    setLoading,

  ] = useState(true);

  const loadNotification = useCallback(async () => {

  try {

    const data =
      await notificationService.getNotification(id);

    if (!data.isRead) {

      await notificationService.markAsRead(id);

      data.isRead = true;

    }

    setNotification(data);

  }

  catch {

    Toast.show({

      type: 'error',

      text1: 'Unable to load notification',

    });

  }

  finally {

    setLoading(false);

  }

}, [id]);

  useEffect(() => {

    loadNotification();

  }, [loadNotification]);

  const openRelatedPage = useCallback(() => {

  if (!notification?.actionUrl) {
    return;
  }

  const route =
    notificationService.navigateFromAction(
      notification.actionUrl,
    );

  if (!route) {
    return;
  }

  if (route.parent === 'Main') {

    navigation.navigate(
      'Main',
      {
        screen: route.screen,
      },
    );

  } else {

    navigation.navigate(
      route.parent,
    );

  }

}, [notification, navigation]);

  if (loading) {

    return (

        <LoadingScreen
        title="Loading Notification"
        subtitle="Retrieving notification details."
        />

    );

    }

if (!notification) {
  return null;
}

 const bannerColor = {

  LOW: COLORS.success,

  MEDIUM: COLORS.information,

  HIGH: COLORS.warning,

  CRITICAL: COLORS.danger,

}[
  notification.priority as NotificationPriority
];
  return (

    <SafeAreaView

        style={styles.container}

        >

      <ScrollView

            contentContainerStyle={styles.content}

            >

            <PageHeader
                title="Notification Details"
                subtitle="View notification information"
                onBack={() => navigation.goBack()}
                />

            <View style={styles.iconContainer}>

            <View style={styles.avatar}>

                <MaterialIcons
                name="notifications-active"
                size={46}
                color={COLORS.primary}
                />

            </View>

            </View>

            <View

            style={[
                styles.banner,
                {
                    backgroundColor: bannerColor,
                },
                ]}

            >

          <Text

            style={styles.bannerTitle}

          >

            {notification.title}

          </Text>

          <Text

            style={styles.bannerSubtitle}

          >

            Priority

          </Text>

          <NotificationBadge

            priority={notification.priority}

          />

        </View>

        <View
            style={styles.detailCard}
        >

          <Text

            style={styles.sectionTitle}
          >

            Message

          </Text>

          <Text

            style={styles.message}
          >

            {notification.message}

          </Text>

        </View>

        <View style={styles.detailCard}>

          <Text>

            Type

          </Text>

          <Text>

            {notification.type}

          </Text>

          <Text

            style={styles.fieldSpacing}

          >

            Status

          </Text>

          <Text>

            {

              notification.isRead

                ? 'Read'

                : 'Unread'

            }

          </Text>

          <Text

            style={styles.fieldSpacing}>

            Received

          </Text>

          <Text>

            {

              new Date(

                notification.createdAt,

              ).toLocaleString()

            }

          </Text>

        </View>

        {

          notification.metadata && (

            <View style={styles.detailCard}>

              <Text style={styles.metadataTitle}>

                Additional Information

              </Text>

              <Text>

                {

                  JSON.stringify(

                    notification.metadata,

                    null,

                    2,

                  )

                }

              </Text>

            </View>

          )

        }

        {

          notification.actionUrl && (

            <TouchableOpacity
                style={styles.button}
                onPress={openRelatedPage}
            >

              <Text style={styles.buttonText}>

                Open Related Page

              </Text>

            </TouchableOpacity>

          )

        }

      </ScrollView>

    </SafeAreaView>

  );

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: 20,
  },

  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  banner: {
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
  },

  bannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },

  bannerSubtitle: {
    color: 'white',
    marginTop: 10,
  },

  detailCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
  },

  message: {
    lineHeight: 24,
  },

  metadataTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },

  fieldSpacing: {
    marginTop: 15,
  },

  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
  },

  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
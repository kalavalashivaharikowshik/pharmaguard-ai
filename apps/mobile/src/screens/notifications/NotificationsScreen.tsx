import {
  FlatList,
  TextInput,
  View,
  Text,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';

import {
  useNavigation,
} from '@react-navigation/native';

import type {
  Notification,
} from '../../types/notification';

import Toast from 'react-native-toast-message';

import NotificationCard from '../../components/notifications/NotificationCard';
import LoadingScreen from '../../components/common/LoadingScreen';
import SummaryCard from '../../components/common/SummaryCard';
import EmptyState from '../../components/common/EmptyState';

import { notificationService } from '../../services/notificationService';

import { COLORS } from '../../utils/theme';
import PageHeader from '../../components/common/PageHeader';
import { notificationEvents } from '../../utils/notificationEvents';

export default function NotificationsScreen() {

  const navigation =
    useNavigation<any>();

  const [

    notifications,

    setNotifications,

  ] = useState<Notification[]>([]);

  const [

  search,

  setSearch,

] = useState('');

const [

  page,

  setPage,

] = useState(1);

const ITEMS_PER_PAGE = 5;

  const [

    refreshing,

    setRefreshing,

  ] = useState(false);

  const [

    loading,

    setLoading,

  ] = useState(true);

  async function loadNotifications() {

    try {

      const data =
        await notificationService.getNotifications();

      setNotifications(data);

    }

    catch {

      Toast.show({

        type: 'error',

        text1: 'Unable to load notifications',

      });

    }

    finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    loadNotifications();

    const unsubscribe =

      notificationEvents.subscribe(() => {

        loadNotifications();

      });

    return unsubscribe;

  }, []);

  const filtered = useMemo(() => {

  return notifications.filter(n => {

    const keyword = search.toLowerCase();

    return (

      n.title.toLowerCase().includes(keyword)

      ||

      n.message.toLowerCase().includes(keyword)

    );

  });

}, [notifications, search]);

  const sortedNotifications = useMemo(() => {

    return [...filtered].sort(

        (a, b) =>

        new Date(b.createdAt).getTime()

        -

        new Date(a.createdAt).getTime(),

    );

    }, [filtered]);

const paginatedNotifications =
  sortedNotifications.slice(

    (page - 1) * ITEMS_PER_PAGE,

    page * ITEMS_PER_PAGE,

  );

const totalPages =
  Math.max(

    1,

    Math.ceil(

      sortedNotifications.length /

      ITEMS_PER_PAGE,

    ),

  );

  const summary = useMemo(() => ({

  unread: notifications.filter(

    n => !n.isRead,

  ).length,

  critical: notifications.filter(

    n =>

      n.priority === 'CRITICAL',

  ).length,

  today: notifications.filter(n => {

    const date = new Date(n.createdAt);

    const now = new Date();

    return (

      date.toDateString()

      ===

      now.toDateString()

    );

  }).length,

}), [notifications]);

async function onRefresh() {

  try {

    setRefreshing(true);

    await loadNotifications();

    setPage(1);

  }

  finally {

    setRefreshing(false);

  }

}

const openNotification = useCallback(

  (id: string) => {

    navigation.navigate(

      'NotificationDetail',

      {

        id,

      },

    );

  },

  [navigation],

);

const renderItem = useCallback(

  ({ item }: any) => (

    <NotificationCard

      notification={item}

      onPress={() =>

        openNotification(item.id)

      }

    />

  ),

  [openNotification],

);

  if (loading) {

    return (

        <LoadingScreen
        title="Loading Notifications"
        subtitle="Checking for new updates."
        />

    );

    }


  return (

    <SafeAreaView

      style={{

        flex: 1,

        backgroundColor:
          COLORS.background,

      }}

    >

      <FlatList

        ListHeaderComponent={

          <>

            <PageHeader
              title="Notifications"
              subtitle="Recent alerts and updates"
              onBack={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('Home');
                }
              }}
            />

            <View

              style={{

                flexDirection: 'row',

                flexWrap: 'wrap',

                justifyContent:
                  'space-between',

                paddingHorizontal: 22,

              }}

            >

              <SummaryCard

                title="Total"

                value={
                  notifications.length
                }

                icon="notifications"

              />

              <SummaryCard

                title="Unread"

                value={summary.unread}

                icon="mark-email-unread"

              />

              <SummaryCard

                title="Critical"

                value={summary.critical}

                icon="priority-high"

              />

              <SummaryCard

                title="Today"

                value={summary.today}

                icon="today"

              />

            </View>

            <TextInput

              placeholder="Search notifications..."

              placeholderTextColor={
                COLORS.subtitle
              }

              value={search}

              onChangeText={(text) => {

                setSearch(text);

                setPage(1);

                }}

              style={{

                backgroundColor:
                  'white',

                marginHorizontal:20,
                marginTop:20,
                marginBottom:18,

                padding: 16,

                borderRadius: 14,

                borderWidth: 1,

                borderColor:
                  COLORS.border,

              }}

            />

          </>

        }

        
        data={paginatedNotifications}

        keyExtractor={

          item => item.id

        }
        initialNumToRender={5}

        maxToRenderPerBatch={5}

        windowSize={10}

        removeClippedSubviews

        showsVerticalScrollIndicator={false}

        renderItem={renderItem}

        refreshControl={

          <RefreshControl

            refreshing={

              refreshing

            }

            onRefresh={onRefresh}

          />

        }

        contentContainerStyle={{

          paddingHorizontal: 20,

          paddingBottom: 30,

        }}

        ListEmptyComponent={

        <EmptyState

            icon="notifications-none"

            title="No Notifications"

            subtitle="Everything looks good. We'll notify you immediately if something changes."

        />

        }

        ListFooterComponent={

        <View
        style={{

            flexDirection:'row',

            justifyContent:'space-between',

            alignItems:'center',

            paddingTop:24,
            paddingBottom:10,

        }}
        >

        <TouchableOpacity

        disabled={page===1}

        onPress={()=>{

        if(page>1){

        setPage(page-1);

        }

        }}

        >

        <Text
        style={{

        fontSize:16,

        fontWeight:'700',

        color:

        page===1
        ?COLORS.subtitle
        :COLORS.primary,

        }}
        >

        ← Previous

        </Text>

        </TouchableOpacity>

        <Text
        style={{

        fontSize:16,

        fontWeight:'700',

        }}
        >

        Page {page} / {totalPages}

        </Text>

        <TouchableOpacity

        disabled={page===totalPages}

        onPress={()=>{

        if(page<totalPages){

        setPage(page+1);

        }

        }}

        >

        <Text
        style={{

        fontSize:16,

        fontWeight:'700',

        color:

        page===totalPages
        ?COLORS.subtitle
        :COLORS.primary,

        }}
        >

        Next →

        </Text>

        </TouchableOpacity>

        </View>

        }

      />

    </SafeAreaView>

  );

}
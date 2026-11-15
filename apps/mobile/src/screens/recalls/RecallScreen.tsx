import {
  FlatList,
  TextInput,
  View,
  Text,
  RefreshControl,
  ScrollView,
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

import Toast from 'react-native-toast-message';

import RecallCard from '../../components/recalls/RecallCard';
import SummaryCard from '../../components/common/SummaryCard';
import FilterChip from '../../components/common/FilterChip';
import { recallService } from '../../services/recallService';
import MyRecallTasks from '../../components/recalls/MyRecallTasks';
import { COLORS } from '../../utils/theme';
import type { Recall } from '../../types/recall';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import { syncEvents } from '../../utils/syncEvents';

export default function RecallScreen() {

  const navigation =
    useNavigation<any>();

  const [

    recalls,

    setRecalls,

  ] = useState<Recall[]>([]);

  const [

    search,

    setSearch,

  ] = useState('');

  const [

    severity,

    setSeverity,

  ] = useState('ALL');

  const [

    status,

    setStatus,

  ] = useState('ALL');

  const [

    page,

    setPage,

  ] = useState(1);

  const ITEMS_PER_PAGE = 5;

  const [

    refreshing,

    setRefreshing,

  ] = useState(false);

  const loadRecalls = useCallback(async () => {

    try {

      const data =
        await recallService.getRecalls();

      setRecalls(data);

    }

    catch (error) {

      console.log(error);

      Toast.show({

        type: 'error',

        text1: 'Unable to load recalls',

      });

    }

  }, []);

  useEffect(() => {

    loadRecalls();

    const unsubscribe =

        syncEvents.subscribe(() => {

        loadRecalls();

        });

    return unsubscribe;

    }, [loadRecalls]);

  function onSearch(
    text: string,
  ) {

    setSearch(text);

    setPage(1);

  }

  const refresh = useCallback(async () => {

    try {

      setRefreshing(true);

      await loadRecalls();

    }

    finally {

      setRefreshing(false);

    }

  }, [loadRecalls]);

  const summary = useMemo(() => ({

    active: recalls.filter(

      r => r.status === 'ACTIVE',

    ).length,

    critical: recalls.filter(

      r => r.severity === 'CRITICAL',

    ).length,

    completed: recalls.filter(

      r => r.status === 'COMPLETED',

    ).length,

  }), [recalls]);

  const filtered = useMemo(() => {

    return recalls.filter(r => {

      const matchesSearch =

        r.batch.drugName

          .toLowerCase()

          .includes(search.toLowerCase())

        ||

        r.recallNumber

          .toLowerCase()

          .includes(search.toLowerCase());

      const matchesSeverity =

        severity === 'ALL'

          ? true

          : r.severity === severity;

      const matchesStatus =

        status === 'ALL'

          ? true

          : r.status === status;

      return (

        matchesSearch &&

        matchesSeverity &&

        matchesStatus

      );

    });

  }, [

    recalls,

    search,

    severity,

    status,

  ]);

  const paginatedRecalls =

    filtered.slice(

      (page - 1) * ITEMS_PER_PAGE,

      page * ITEMS_PER_PAGE,

    );

  const totalPages =

    Math.max(

      1,

      Math.ceil(

        filtered.length /

        ITEMS_PER_PAGE,

      ),

    );

  const openRecall = useCallback(

    (id: string) => {

      navigation.navigate(

        'RecallDetail',

        {

          id,

        },

      );

    },

    [navigation],

  );

  const renderItem = useCallback(

    ({ item }: { item: Recall }) => (

      <RecallCard

        recall={item}

        onPress={() =>

          openRecall(item.id)

        }

      />

    ),

    [openRecall],

  );

  return (

    <SafeAreaView

      style={{

        flex: 1,

        backgroundColor: COLORS.background,

      }}

    >

      <FlatList

        ListHeaderComponent={

          <>

            <PageHeader
              title="Recalls"
              subtitle="Drug recalls and safety alerts"
              onBack={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('Home');
                }
              }}
            />

            <MyRecallTasks />

            <View

              style={{

                flexDirection: 'row',

                flexWrap: 'wrap',

                justifyContent: 'space-between',

                paddingHorizontal: 20,

              }}

            >

              <SummaryCard

                title="Total"

                value={recalls.length}

                icon="warning"

              />

              <SummaryCard

                title="Active"

                value={summary.active}

                icon="error"

              />

              <SummaryCard

                title="Critical"

                value={summary.critical}

                icon="dangerous"

              />

              <SummaryCard

                title="Completed"

                value={summary.completed}

                icon="check-circle"

              />

            </View>

            <TextInput

              placeholder="Search recalls..."

              value={search}

              onChangeText={onSearch}

              style={{

                backgroundColor: 'white',

                margin: 20,

                padding: 16,

                borderRadius: 14,

                borderWidth: 1,

                borderColor: COLORS.border,

              }}

            />

            <ScrollView

              horizontal

              showsHorizontalScrollIndicator={false}

              style={{

                marginHorizontal: 20,

                marginBottom: 12,

              }}

            >

              <FilterChip

                label="All"

                active={severity === 'ALL'}

                onPress={() => {

                  setSeverity('ALL');

                  setPage(1);

                }}

              />

              <FilterChip

                label="Critical"

                active={severity === 'CRITICAL'}

                onPress={() => {

                  setSeverity('CRITICAL');

                  setPage(1);

                }}

              />

              <FilterChip

                label="High"

                active={severity === 'HIGH'}

                onPress={() => {

                  setSeverity('HIGH');

                  setPage(1);

                }}

              />

              <FilterChip

                label="Medium"

                active={severity === 'MEDIUM'}

                onPress={() => {

                  setSeverity('MEDIUM');

                  setPage(1);

                }}

              />

              <FilterChip

                label="Low"

                active={severity === 'LOW'}

                onPress={() => {

                  setSeverity('LOW');

                  setPage(1);

                }}

              />

            </ScrollView>
                    <ScrollView

              horizontal

              showsHorizontalScrollIndicator={false}

              style={{

                marginHorizontal: 20,

                marginBottom: 20,

              }}

            >

              <FilterChip

                label="All"

                active={status === 'ALL'}

                onPress={() => {

                  setStatus('ALL');

                  setPage(1);

                }}

              />

              <FilterChip

                label="Active"

                active={status === 'ACTIVE'}

                onPress={() => {

                  setStatus('ACTIVE');

                  setPage(1);

                }}

              />

              <FilterChip

                label="Completed"

                active={status === 'COMPLETED'}

                onPress={() => {

                  setStatus('COMPLETED');

                  setPage(1);

                }}

              />

            </ScrollView>

          </>

        }

        data={paginatedRecalls}

        keyExtractor={(item) => item.id}

        initialNumToRender={5}

        maxToRenderPerBatch={5}

        windowSize={10}

        removeClippedSubviews

        showsVerticalScrollIndicator={false}

        refreshControl={

          <RefreshControl

            refreshing={refreshing}

            onRefresh={refresh}

          />

        }

        renderItem={renderItem}

        contentContainerStyle={{

          paddingHorizontal: 20,

          paddingBottom: 30,

        }}

        ListEmptyComponent={

          <EmptyState

            icon="health-and-safety"

            title="No Recalls Found"

            subtitle="There are currently no recall records matching your search or selected filters."

          />

        }

        ListFooterComponent={

          <View

            style={{

              flexDirection: 'row',

              justifyContent: 'space-between',

              alignItems: 'center',

              paddingTop: 24,

              paddingBottom: 10,

            }}

          >

            <TouchableOpacity

              disabled={page === 1}

              onPress={() => {

                if (page > 1) {

                  setPage(page - 1);

                }

              }}

            >

              <Text

                style={{

                  fontSize: 16,

                  fontWeight: '700',

                  color:

                    page === 1

                      ? COLORS.subtitle

                      : COLORS.primary,

                }}

              >

                ← Previous

              </Text>

            </TouchableOpacity>

            <Text

              style={{

                fontSize: 16,

                fontWeight: '700',

              }}

            >

              Page {page} / {totalPages}

            </Text>

            <TouchableOpacity

              disabled={page === totalPages}

              onPress={() => {

                if (page < totalPages) {

                  setPage(page + 1);

                }

              }}

            >

              <Text

                style={{

                  fontSize: 16,

                  fontWeight: '700',

                  color:

                    page === totalPages

                      ? COLORS.subtitle

                      : COLORS.primary,

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
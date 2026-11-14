import {
  FlatList,
  Text,
  View,
  RefreshControl,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import React, {
  useMemo,
  useState,
  useCallback,
} from 'react';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import {
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';

import { useTransfers } from '../../hooks/useTransfers';

import TransferCard from '../../components/transfers/TransferCard';

import SummaryCard from '../../components/common/SummaryCard';

import FilterChip from '../../components/common/FilterChip';

import { COLORS } from '../../utils/theme';

import {
  useAuth,
} from '../../context/AuthContext';

import PageHeader from '../../components/common/PageHeader';

import EmptyState from '../../components/common/EmptyState';

export default function TransfersScreen() {

  const navigation = useNavigation<any>();

  const {

    transfers,

    refresh,

  } = useTransfers();

  const [

  refreshing,

  setRefreshing,

] = useState(false);

async function onRefresh() {

  try {

    setRefreshing(true);

    await refresh();

    setPage(1);

  }

  finally {

    setRefreshing(false);

  }

}

  const [

    search,

    setSearch,

  ] = useState('');

  const [

    status,

    setStatus,

    ] = useState('ALL');

    const [

    page,

    setPage,

    ] = useState(1);

    const ITEMS_PER_PAGE = 5;

  const {

    user,

    } = useAuth();

    const role = user?.role;

  useFocusEffect(

    React.useCallback(() => {

        refresh();

    }, [refresh]),

    );

  const summary = useMemo(() => ({

  total: transfers.length,

  completed: transfers.filter(

    t => t.status === 'COMPLETED',

  ).length,

  pending: transfers.filter(

    t => t.status === 'PENDING',

  ).length,

  rejected: transfers.filter(

    t => t.status === 'REJECTED',

  ).length,

}), [transfers]);
  const filteredTransfers =
    useMemo(() => {

      return transfers.filter(t => {

        const searchMatch =

          t.batch.drugName
            .toLowerCase()
            .includes(search.toLowerCase())

          ||

          t.batch.batchNumber
            .toLowerCase()
            .includes(search.toLowerCase());

        const statusMatch =

          status === 'ALL'

            ? true

            : t.status === status;

        return searchMatch && statusMatch;

      });

    }, [

      transfers,

      search,

      status,

    ]);

    const paginatedTransfers =
  filteredTransfers.slice(

    (page - 1) * ITEMS_PER_PAGE,

    page * ITEMS_PER_PAGE,

  );

const totalPages =
  Math.max(

    1,

    Math.ceil(

      filteredTransfers.length /

      ITEMS_PER_PAGE,

    ),

  );
  const openTransfer = useCallback(

  (item: any) => {

    navigation.navigate(

      'TransferDetail',

      {

        transfer: item,

      },

    );

  },

  [navigation],

);

const renderItem = useCallback(

  ({ item }: any) => (

    <TransferCard

      item={item}

      onPress={() => openTransfer(item)}

    />

  ),

  [openTransfer],

);

  return (

    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
      }}
    >

      <FlatList

        contentContainerStyle={{
          padding: 20,
          paddingBottom: 120,
        }}

        data={paginatedTransfers}

        keyExtractor={(item) => item.id}

        initialNumToRender={5}

        maxToRenderPerBatch={5}

        windowSize={10}

        removeClippedSubviews

        showsVerticalScrollIndicator={false}

        refreshControl={
        <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
        />
        }

        ListHeaderComponent={

          <>

            <PageHeader
              title="Transfers"
              subtitle="Track inventory transfers"
              onBack={() => navigation.navigate('Home')}
            />

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                marginBottom: 20,
                paddingHorizontal: 22,
              }}
            >

              <SummaryCard
                title="Transfers"
                value={summary.total}
                icon="local-shipping"
              />

              <SummaryCard
                title="Completed"
                value={summary.completed}
                icon="check-circle"
              />

              <SummaryCard
                title="Pending"
                value={summary.pending}
                icon="schedule"
              />

              <SummaryCard
                title="Rejected"
                value={summary.rejected}
                icon="cancel"
              />

            </View>

            <TextInput

              placeholder="Search drug or batch..."

              value={search}

              onChangeText={(text) => {

                setSearch(text);

                setPage(1);

                }}

              style={{
                backgroundColor: 'white',
                borderRadius: 14,
                padding: 15,
                marginBottom: 18,
                borderWidth: 1,
                borderColor: COLORS.border,
                }}

            />

            <ScrollView

              horizontal

              showsHorizontalScrollIndicator={false}

              style={{

                marginBottom:20,

              }}

            >

              <FilterChip

                label="All"

                active={status==='ALL'}

                onPress={() => {

                setStatus('ALL');

                setPage(1);

                }}

              />

              <FilterChip

                label="Completed"

                active={status==='COMPLETED'}

                onPress={() => {
                  setStatus('COMPLETED');
                  setPage(1);
                }}

              />

              <FilterChip

                label="Pending"

                active={status==='PENDING'}

                onPress={() => {
                  setStatus('PENDING');
                  setPage(1);
                }}

              />

              <FilterChip

                label="Rejected"

                active={status==='REJECTED'}

                onPress={() => {
                  setStatus('REJECTED');
                  setPage(1);
                }}

              />

            </ScrollView>

          </>

        }

        renderItem={renderItem}

        ListEmptyComponent={

        <EmptyState
            icon="local-shipping"
            title="No Transfers"
            subtitle="Your completed inventory transfers will appear here."
        />

        }

        ListFooterComponent={
            <View
            style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                paddingTop: 24,
                paddingBottom: 10,
                paddingHorizontal: 2,
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

      {

        (

          role === 'MANUFACTURER'

          ||

          role === 'DISTRIBUTOR'

        )

        &&

        (

          <TouchableOpacity

            onPress={()=>

              navigation.navigate(
                'CreateTransfer',
              )

            }

            style={{

              position:'absolute',

              bottom:25,

              right:25,

              width:65,

              height:65,

              borderRadius:33,

              justifyContent:'center',

              alignItems:'center',

              backgroundColor:COLORS.primary,

              elevation:6,

            }}

          >

            <MaterialIcons

              name="add"

              size={34}

              color="white"

            />

          </TouchableOpacity>

        )

      }

    </SafeAreaView>

  );

}
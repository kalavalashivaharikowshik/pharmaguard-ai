import {
  FlatList,
  RefreshControl,
  TextInput,
  ScrollView,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useMemo,
  useState,
} from 'react';

import {
  useNavigation,
} from '@react-navigation/native';

import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import LoadingScreen from '../../components/common/LoadingScreen';
import ScanHistoryCard from '../../components/scanHistory/ScanHistoryCard';
import FilterChip from '../../components/common/FilterChip';

import {
  useScanHistory,
} from '../../hooks/useScanHistory';

import { COLORS } from '../../utils/theme';

export default function ScanHistoryScreen() {

  const navigation =
    useNavigation<any>();

  const {

    history,

    loading,

    refresh,

  } = useScanHistory();

  const [

    refreshing,

    setRefreshing,

  ] = useState(false);

  const [

    search,

    setSearch,

  ] = useState('');

  const [

    filter,

    setFilter,

  ] = useState('ALL');

  async function onRefresh() {

    setRefreshing(true);

    await refresh();

    setRefreshing(false);

  }

  const filtered = useMemo(() => {

    return history.filter(item => {

      const searchMatch =

        item.batchNumber
          .toLowerCase()
          .includes(search.toLowerCase());

      const filterMatch =

        filter === 'ALL'

          ? true

          : filter === 'SUCCESS'

          ? item.verified

          : !item.verified;

      return searchMatch && filterMatch;

    });

  }, [

    history,

    search,

    filter,

  ]);

  if (loading) {

    return (

      <LoadingScreen

        title="Loading Scan History"

        subtitle="Retrieving verification records."

      />

    );

  }

  return (

    <SafeAreaView
      style={{
        flex:1,
        backgroundColor:COLORS.background,
      }}
    >

      <FlatList

        data={filtered}

        keyExtractor={

          item => item.id

        }

        contentContainerStyle={{

          padding:20,

          paddingBottom:30,

        }}

        ListHeaderComponent={

          <>

            <PageHeader

              title="Scan History"

              subtitle="QR verification records"

              onBack={()=>

                navigation.goBack()

              }

            />

            <TextInput

              placeholder="Search Batch Number"

              value={search}

              onChangeText={setSearch}

              style={{

                backgroundColor:'white',

                borderRadius:14,

                padding:15,

                marginBottom:18,

                borderWidth:1,

                borderColor:COLORS.border,

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

                active={filter==='ALL'}

                onPress={()=>

                  setFilter('ALL')

                }

              />

              <FilterChip

                label="Verified"

                active={filter==='SUCCESS'}

                onPress={()=>

                  setFilter('SUCCESS')

                }

              />

              <FilterChip

                label="Failed"

                active={filter==='FAILED'}

                onPress={()=>

                  setFilter('FAILED')

                }

              />

            </ScrollView>

          </>

        }

        renderItem={({item})=>(

          <ScanHistoryCard

            item={item}

            onPress={()=>{}}

          />

        )}

        refreshControl={

          <RefreshControl

            refreshing={refreshing}

            onRefresh={onRefresh}

          />

        }

        ListEmptyComponent={

          <EmptyState

            icon="qr-code-scanner"

            title="No Scan History"

            subtitle="No verification records match your search."

          />

        }

      />

    </SafeAreaView>

  );

}
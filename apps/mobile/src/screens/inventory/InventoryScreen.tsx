import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
} from 'react-native';

import {
  useMemo,
  useState,
  useCallback,
} from 'react';

import {
  useNavigation,
} from '@react-navigation/native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import InventoryCard from '../../components/inventory/InventoryCard';

import { useInventory } from '../../hooks/useInventory';

import { COLORS } from '../../utils/theme';

import FilterChip from '../../components/inventory/FilterChip';

import { useAuth } from '../../context/AuthContext';

import InventorySkeleton from '../../components/inventory/InventorySkeleton';

import SummaryCard from '../../components/inventory/SummaryCard';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';

export default function InventoryScreen() {

  const {
    inventory,
    loading,
    refresh,
  } = useInventory();

  const { user } = useAuth();

  const role = user?.role;

  const navigation =
    useNavigation<any>();

  const [search, setSearch] =
    useState('');

  const [status, setStatus] =
  useState('ALL');

    const [page, setPage] =
    useState(1);

    const ITEMS_PER_PAGE = 5;
    const [

    refreshing,

    setRefreshing,

    ] = useState(false);

  const summary = useMemo(() => ({

  totalItems: inventory.length,

  totalUnits: inventory.reduce(

    (total, item) => total + item.quantity,

    0,

  ),

  active: inventory.filter(

    item => item.batch.status === 'ACTIVE',

  ).length,

  revoked: inventory.filter(

    item => item.batch.status === 'REVOKED',

  ).length,

}), [inventory]);

  const filteredInventory =
    useMemo(() => {

      return inventory.filter(item => {

        const drugMatch =
          item.batch.drugName
            .toLowerCase()
            .includes(
              search.toLowerCase(),
            );

        const batchMatch =
          item.batch.batchNumber
            .toLowerCase()
            .includes(
              search.toLowerCase(),
            );

        const statusMatch =
          status === 'ALL'
            ? true
            : item.batch.status === status;

        return (
          (drugMatch || batchMatch) &&
          statusMatch
        );

      });

    }, [
      inventory,
      search,
      status,
    ]);

  const paginatedInventory =
    filteredInventory.slice(

        (page - 1) * ITEMS_PER_PAGE,

        page * ITEMS_PER_PAGE,

    );

    const totalPages =
    Math.max(

        1,

        Math.ceil(
        filteredInventory.length /
        ITEMS_PER_PAGE,
        ),

    );
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

    const openInventory = useCallback(

  (item: any) => {

    navigation.navigate(

      'InventoryDetail',

      {

        inventory: item,

      },

    );

  },

  [navigation],

);

const renderItem = useCallback(

  ({ item }: any) => (

    <InventoryCard

      item={item}

      role={role}

      onPress={() =>

        openInventory(item)

      }

    />

  ),

  [openInventory, role],

);

  if (loading) {

    return (

      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          padding: 16,
        }}
      >

        <InventorySkeleton />

        <InventorySkeleton />

        <InventorySkeleton />

      </SafeAreaView>

    );

  }

  return (

    <SafeAreaView
      style={styles.container}
    >

      <FlatList

        data={paginatedInventory}

        keyExtractor={(item) => item.id}

        initialNumToRender={5}

        maxToRenderPerBatch={5}

        windowSize={10}

        removeClippedSubviews

        showsVerticalScrollIndicator={false}

        ListHeaderComponent={

          <>

            <PageHeader
              title="Inventory"
              subtitle={
                role === 'SUPER_ADMIN'
                  ? 'Network Inventory'
                  : role === 'REGULATOR'
                  ? 'Audit Inventory View'
                  : 'My Inventory'
              }
              onBack={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('Home');
                }
              }}
            />

            <Text
              style={styles.summaryTitle}
            >
              Inventory Summary
            </Text>

            <View
              style={styles.summaryRow}
            >

              <SummaryCard
                title="Items"
                value={summary.totalItems}
                icon="inventory"
                color={COLORS.information}
              />

              <SummaryCard
                title="Units"
                value={summary.totalUnits}
                icon="medication"
                color={COLORS.primary}
              />

            </View>

            <View
              style={styles.summaryRowBottom}
            >

              <SummaryCard
                title="Active"
                value={summary.active}
                icon="verified"
                color={COLORS.success}
              />

              <SummaryCard
                title="Revoked"
                value={summary.revoked}
                icon="warning"
                color={COLORS.danger}
              />

            </View>

            <TextInput
                placeholder="Search drug or batch..."
                value={search}
                onChangeText={(text) => {
                    setSearch(text);
                    setPage(1);
                }}
                style={styles.searchInput}
                />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContent}
              style={styles.filterScroll}
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
                label="Recalled"
                active={status === 'RECALLED'}
                onPress={() => {
                  setStatus('RECALLED');
                  setPage(1);
                }}
              />

              <FilterChip
                label="Revoked"
                active={status === 'REVOKED'}
                onPress={() => {
                  setStatus('REVOKED');
                  setPage(1);
                }}
              />

              <FilterChip
                label="Expired"
                active={status === 'EXPIRED'}
                onPress={() => {
                  setStatus('EXPIRED');
                  setPage(1);
                }}
              />

            </ScrollView>

          </>

        }
        renderItem={renderItem}

        refreshControl={

          <RefreshControl

            refreshing={refreshing}

            onRefresh={onRefresh}

          />

        }

        ListEmptyComponent={

            <EmptyState

                icon="inventory"

                title={
                role === 'SUPER_ADMIN'
                    ? 'No Inventory Across Network'
                    : role === 'REGULATOR'
                    ? 'No Inventory Available For Audit'
                    : 'No Inventory Available'
                }

                subtitle={
                role === 'SUPER_ADMIN'
                    ? 'No inventory exists across the network.'
                    : role === 'REGULATOR'
                    ? 'No inventory is available for audit.'
                    : 'Inventory assigned to your organization will appear here.'
                }

            />

            }

        contentContainerStyle={styles.list}

        ListFooterComponent={

        <View
        style={styles.pagination}
        >

        <Text
        onPress={()=>{
        if(page>1){

        setPage(page-1);

        }
        }}
        style={[
        styles.paginationButton,
        {
            color:
            page === 1
                ? COLORS.subtitle
                : COLORS.primary,
        },
        ]}
        >

        ← Previous

        </Text>

        <Text style={styles.pageNumber}>
            Page {page} / {totalPages}
            </Text>

        <Text
        onPress={() => {
            if (page < totalPages) {
            setPage(page + 1);
            }
        }}
        style={[
            styles.paginationButton,
            {
            color:
                page === totalPages
                ? COLORS.subtitle
                : COLORS.primary,
            },
        ]}
        >
        Next →
        </Text>

        </View>

        }

        />

    </SafeAreaView>

  );

}

const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: COLORS.background,

  },

  list: {

    paddingBottom: 30,

  },

  emptyContainer: {

    marginTop: 80,

    alignItems: 'center',

  },

  emptyTitle: {

    fontSize: 22,

    fontWeight: '700',

    color: COLORS.text,

  },

  emptySubtitle: {

    marginTop: 8,

    textAlign: 'center',

    color: COLORS.subtitle,

    paddingHorizontal: 40,

    lineHeight: 22,

  },

  summaryTitle: {
  fontSize: 22,
  fontWeight: '700',
  marginHorizontal: 16,
  marginBottom: 15,
},

summaryRow: {
  flexDirection: 'row',
  marginHorizontal: 16,
  marginBottom: 12,
},

summaryRowBottom: {
  flexDirection: 'row',
  marginHorizontal: 16,
  marginBottom: 20,
},

searchInput: {
  backgroundColor: 'white',
  padding: 15,
  borderRadius: 14,
  marginHorizontal: 16,
  marginBottom: 18,
  borderWidth: 1,
  borderColor: COLORS.border,
},

filterContent: {
  paddingHorizontal: 16,
  alignItems: 'center',
  paddingVertical: 6,
},

filterScroll: {
  marginBottom: 18,
  minHeight: 56,
},

pagination: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingVertical: 25,
},

paginationButton: {
  fontSize: 16,
  fontWeight: '700',
},

pageNumber: {
  fontWeight: '700',
  fontSize: 16,
},

});
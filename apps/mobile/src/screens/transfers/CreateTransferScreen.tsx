import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
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
  InventoryBatch,
} from '../../types/inventory';

import type {
  User,
} from '../../types/auth';

import Toast from 'react-native-toast-message';

import {
  Picker,
} from '@react-native-picker/picker';

import {
  MaterialIcons,
} from '@expo/vector-icons';

import { COLORS } from '../../utils/theme';

import {
  inventoryService,
} from '../../services/inventoryService';

import {
  transferService,
} from '../../services/transferService';

import PageHeader from '../../components/common/PageHeader';
import LoadingScreen from '../../components/common/LoadingScreen';

export default function CreateTransferScreen() {

  const navigation =
    useNavigation<any>();

  const [
    inventory,
    setInventory,
  ] = useState<InventoryBatch[]>([]);

  const [
    receivers,
    setReceivers,
  ] = useState<User[]>([]);

  const [
    selectedBatch,
    setSelectedBatch,
  ] = useState('');

  const [
    selectedReceiver,
    setSelectedReceiver,
  ] = useState('');

  const [
    quantity,
    setQuantity,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    pageLoading,
    setPageLoading,
  ] = useState(true);

  const selectedInventory = useMemo(

    () =>

      inventory.find(

        i => i.batch.id === selectedBatch,

      ),

    [inventory, selectedBatch],

  );

  const selectedUser = useMemo(

    () =>

      receivers.find(

        u => u.id === selectedReceiver,

      ),

    [receivers, selectedReceiver],

  );

  const disableButton = useMemo(

    () =>

      loading ||

      !selectedBatch ||

      !selectedReceiver ||

      !quantity,

    [

      loading,

      quantity,

      selectedBatch,

      selectedReceiver,

    ],

  );

  const loadData = useCallback(async () => {

    try {

      const stock =
        await inventoryService.getMyInventory();

      const active =
        stock.filter(

          i =>

            i.batch.status === 'ACTIVE'

            &&

            i.quantity > 0,

        );

      setInventory(active);

      const users =
        await transferService.getTransferUsers();

      setReceivers(users);

    }

    catch {

      Toast.show({

        type: 'error',

        text1: 'Unable to load data',

      });

    }

    finally {

      setPageLoading(false);

    }

  }, []);

  const createTransfer = useCallback(async () => {

    if (!selectedBatch) {

      Toast.show({

        type: 'error',

        text1: 'Select a batch',

      });

      return;

    }

    if (!selectedReceiver) {

      Toast.show({

        type: 'error',

        text1: 'Select a receiver',

      });

      return;

    }

    if (!quantity) {

      Toast.show({

        type: 'error',

        text1: 'Enter quantity',

      });

      return;

    }

    const qty =
      Number(quantity);

    if (

      Number.isNaN(qty) ||

      qty <= 0

    ) {

      Toast.show({

        type: 'error',

        text1: 'Invalid quantity',

      });

      return;

    }

    if (

      selectedInventory &&

      qty >

      selectedInventory.quantity

    ) {

      Toast.show({

        type: 'error',

        text1: 'Insufficient Inventory',

      });

      return;

    }

    Alert.alert(

      'Confirm Transfer',

      `Drug: ${selectedInventory?.batch.drugName}

Receiver: ${selectedUser?.fullName}

Quantity: ${qty} Units`,

      [

        {

          text: 'Cancel',

          style: 'cancel',

        },

        {

          text: 'Transfer',

          onPress: async () => {

            try {

              setLoading(true);

              const result =

                await transferService.createTransfer({

                  batchId: selectedBatch,

                  toUserId: selectedReceiver,

                  quantity: qty,

                });

              if (result?.queued) {

                Toast.show({

                  type: 'success',

                  text1: 'Transfer Queued',

                  text2:
                    'Will automatically sync when internet returns.',

                });

              }

              else {

                Toast.show({

                  type: 'success',

                  text1: 'Transfer Completed',

                  text2:
                    'Inventory transferred successfully.',

                });

              }

              setSelectedBatch('');

              setSelectedReceiver('');

              setQuantity('');

              navigation.navigate(
                'Main',
                {
                  screen: 'Transfers',
                },
              );

            }

            catch (error: any) {

              Toast.show({

                type: 'error',

                text1: 'Transfer Failed',

                text2:

                  error?.response?.data?.message ??

                  'Unable to create transfer.',

              });

            }

            finally {

              setLoading(false);

            }

          },

        },

      ],

    );

  }, [

    navigation,

    quantity,

    selectedBatch,

    selectedInventory,

    selectedReceiver,

    selectedUser,

  ]);

  useEffect(() => {

    loadData();

  }, [loadData]);

  if (pageLoading) {

    return (

      <LoadingScreen
        title="Loading Transfer"
        subtitle="Preparing inventory and receiver information."
      />

    );

  }
  return (

  <SafeAreaView
    style={styles.container}
  >

    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >

      <PageHeader
        title="New Transfer"
        subtitle="Transfer inventory to another organization"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.iconContainer}>

        <View style={styles.iconCircle}>

          <MaterialIcons
            name="local-shipping"
            size={46}
            color={COLORS.primary}
          />

        </View>

      </View>

      <View style={styles.card}>

        <Text style={styles.sectionTitle}>
          Batch
        </Text>

        <View style={styles.pickerContainer}>

          <Picker
            selectedValue={selectedBatch}
            onValueChange={setSelectedBatch}
          >

            <Picker.Item
              label="Select Batch"
              value=""
            />

            {

              inventory.map(item => (

                <Picker.Item
                  key={item.id}
                  label={`${item.batch.drugName} (${item.quantity} Units)`}
                  value={item.batch.id}
                />

              ))

            }

          </Picker>

        </View>

        {

          selectedInventory && (

            <>

              <View style={styles.availableBox}>

                <View style={styles.infoRow}>

                  <MaterialIcons
                    name="check-circle"
                    size={18}
                    color={COLORS.success}
                  />

                  <Text
                    style={{
                      color: COLORS.success,
                      fontWeight: '700',
                      marginLeft: 6,
                    }}
                  >
                    Available Stock
                  </Text>

                </View>

                <Text
                  style={{
                    fontSize:22,
                    fontWeight:'700',
                    marginTop:4,
                  }}
                >
                  {selectedInventory.quantity} Units
                </Text>

              </View>

              <View style={styles.infoBox}>

                <View style={styles.infoRowBetween}>

                  <View style={styles.column}>

                    <Text style={styles.label}>
                      Drug Name
                    </Text>

                    <Text style={styles.value}>
                      {selectedInventory.batch.drugName}
                    </Text>

                  </View>

                  <View style={styles.column}>

                    <Text style={styles.label}>
                      Batch
                    </Text>

                    <Text style={styles.value}>
                      {selectedInventory.batch.batchNumber}
                    </Text>

                  </View>

                </View>

                <Text style={styles.label}>
                  Available
                </Text>

                <Text style={styles.value}>
                  {selectedInventory.quantity} Units
                </Text>

              </View>

            </>

          )

        }

        <Text style={styles.sectionTitle}>
          Receiver
        </Text>

        <View style={styles.pickerContainer}>

          <Picker
            selectedValue={selectedReceiver}
            onValueChange={setSelectedReceiver}
          >

            <Picker.Item
              label="Select Receiver"
              value=""
            />

            {

              receivers.map(user => (

                <Picker.Item
                  key={user.id}
                  label={user.fullName}
                  value={user.id}
                />

              ))

            }

          </Picker>

        </View>

        <Text style={styles.sectionTitle}>
          Quantity
        </Text>

        <TextInput
          placeholder="Enter Quantity"
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
          style={styles.input}
        />

        <TouchableOpacity

          disabled={disableButton}

          onPress={createTransfer}

          style={[
            styles.button,
            {
              opacity:
                disableButton
                  ? 0.5
                  : 1,
            },
          ]}

        >

          {

            loading

              ? (

                <ActivityIndicator
                  color="white"
                />

              )

              : (

                <Text style={styles.buttonText}>
                  Create Transfer
                </Text>

              )

          }

        </TouchableOpacity>

      </View>

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

  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
  },

  sectionTitle: {
    fontWeight: '700',
    marginBottom: 8,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    marginBottom: 20,
  },

  availableBox: {
    backgroundColor: '#ECFDF5',
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,
  },

  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  column: {
    flex: 1,
  },

  label: {
    color: COLORS.subtitle,
    fontSize: 13,
  },

  value: {
    fontWeight: '700',
    marginTop: 4,
  },

  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    borderRadius: 14,
    fontSize: 16,
    marginBottom: 28,
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
    fontSize: 17,
  },

});
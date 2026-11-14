import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  MaterialIcons,
} from '@expo/vector-icons';

// Dashboard
import HomeScreen
  from '../screens/dashboard/HomeScreen';

// Inventory
import InventoryScreen
  from '../screens/inventory/InventoryScreen';
import InventoryDetailScreen
  from '../screens/inventory/InventoryDetailScreen';
import QRCodeScreen
  from '../screens/inventory/QRCodeScreen';

// Transfers
import TransfersScreen
  from '../screens/transfers/TransfersScreen';
import TransferDetailScreen
  from '../screens/transfers/TransferDetailScreen';
import CreateTransferScreen
  from '../screens/transfers/CreateTransferScreen';

// Scanner
import ScannerScreen
  from '../screens/scanner/ScannerScreen';
import VerificationResultScreen
  from '../screens/scanner/VerificationResultScreen';
import ScanHistoryScreen 
  from '../screens/scanHistory/ScanHistoryScreen';

// Recall
import RecallScreen
  from '../screens/recalls/RecallScreen';
import RecallDetailScreen
  from '../screens/recalls/RecallDetailScreen';

// Notifications
import NotificationsScreen
  from '../screens/notifications/NotificationsScreen';
import NotificationDetailScreen
  from '../screens/notifications/NotificationDetailScreen';

// Profile
import ProfileScreen
  from '../screens/profile/ProfileScreen';
import ChangePasswordScreen
  from '../screens/profile/ChangePasswordScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';

const Tab =
  createBottomTabNavigator();

const Stack =
  createNativeStackNavigator();

function TabNavigator() {

  return (

    <Tab.Navigator

      screenOptions={{

        headerShown: false,

        tabBarShowLabel: false,

        tabBarActiveTintColor: '#0F766E',

        tabBarInactiveTintColor: '#94A3B8',

        tabBarStyle: {

          height: 72,

          paddingTop: 8,

          paddingBottom: 10,

        },

      }}

    >

      <Tab.Screen

        name="Home"

        component={HomeScreen}

        options={{

          tabBarIcon: ({ color }) => (

            <MaterialIcons

              name="dashboard"

              size={26}

              color={color}

            />

          ),

        }}

      />

      <Tab.Screen

        name="Inventory"

        component={InventoryScreen}

        options={{

          tabBarIcon: ({ color }) => (

            <MaterialIcons

              name="inventory"

              size={26}

              color={color}

            />

          ),

        }}

      />

      <Tab.Screen

        name="Transfers"

        component={TransfersScreen}

        options={{

          tabBarIcon: ({ color }) => (

            <MaterialIcons

              name="swap-horiz"

              size={26}

              color={color}

            />

          ),

        }}

      />

      <Tab.Screen

        name="Scanner"

        component={ScannerScreen}

        options={{

          tabBarIcon: ({ color, focused }) => (

            <MaterialIcons

              name="qr-code-scanner"

              size={focused ? 32 : 28}

              color={color}

            />

          ),

        }}

      />

      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="analytics"
              size={26}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen

        name="Recalls"

        component={RecallScreen}

        options={{

          tabBarIcon: ({ color }) => (

            <MaterialIcons

              name="health-and-safety"

              size={26}

              color={color}

            />

          ),

        }}

      />

    </Tab.Navigator>

  );

}

export default function MainNavigator() {

  return (

    <NavigationContainer>

      <Stack.Navigator

        screenOptions={{

          headerShown: false,

        }}

      >

        <Stack.Screen

          name="Main"

          component={TabNavigator}

        />

        {/* Inventory */}

        <Stack.Screen

          name="InventoryDetail"

          component={InventoryDetailScreen}

        />

        <Stack.Screen

          name="QRCode"

          component={QRCodeScreen}

        />

        {/* Transfers */}

        <Stack.Screen

          name="TransferDetail"

          component={TransferDetailScreen}

        />

        <Stack.Screen

          name="CreateTransfer"

          component={CreateTransferScreen}

        />

        {/* Scanner */}

        <Stack.Screen

          name="VerificationResult"

          component={VerificationResultScreen}

        />

        <Stack.Screen
          name="ScanHistory"

          component={ScanHistoryScreen}
          
        />

        {/* Recall */}

        <Stack.Screen

          name="RecallDetail"

          component={RecallDetailScreen}

        />

        {/* Notifications */}

        <Stack.Screen

          name="Notifications"

          component={NotificationsScreen}

        />

        <Stack.Screen

          name="NotificationDetail"

          component={NotificationDetailScreen}

        />

        {/* Profile */}

        <Stack.Screen

          name="Profile"

          component={ProfileScreen}

        />

        <Stack.Screen

          name="ChangePassword"

          component={ChangePasswordScreen}

        />

      </Stack.Navigator>

    </NavigationContainer>

  );

}
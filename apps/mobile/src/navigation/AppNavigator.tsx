import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { brand, useTheme } from '../ui/theme';
import { haptic, Icon, type IconName } from '../ui/components';
import { firebaseMessagingService } from '../services/firebaseMessagingService';

import HomeScreen from '../screens/home/HomeScreen';
import InventoryScreen from '../screens/inventory/InventoryScreen';
import InventoryDetailScreen from '../screens/inventory/InventoryDetailScreen';
import ScannerScreen from '../screens/scanner/ScannerScreen';
import ScanResultScreen from '../screens/scanner/ScanResultScreen';
import ScanHistoryScreen from '../screens/scanner/ScanHistoryScreen';
import RecallsScreen from '../screens/recalls/RecallsScreen';
import RecallDetailScreen from '../screens/recalls/RecallDetailScreen';
import MoreScreen from '../screens/more/MoreScreen';
import TransfersScreen from '../screens/transfers/TransfersScreen';
import TransferDetailScreen from '../screens/transfers/TransferDetailScreen';
import CreateTransferScreen from '../screens/transfers/CreateTransferScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import NotificationDetailScreen from '../screens/notifications/NotificationDetailScreen';
import InsightsScreen from '../screens/ai/InsightsScreen';
import AssistantScreen from '../screens/ai/AssistantScreen';
import AnalyticsScreen from '../screens/more/AnalyticsScreen';
import DisposalsScreen from '../screens/more/DisposalsScreen';
import ProfileScreen from '../screens/more/ProfileScreen';
import SettingsScreen from '../screens/more/SettingsScreen';
import ChangePasswordScreen from '../screens/more/ChangePasswordScreen';
import QRCodeScreen from '../screens/inventory/QRCodeScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export const navigationRef = createNavigationContainerRef<any>();

const TABS: { name: string; label: string; icon: IconName; activeIcon: IconName }[] = [
  { name: 'Home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { name: 'Inventory', label: 'Inventory', icon: 'package-variant', activeIcon: 'package-variant-closed' },
  { name: 'Scan', label: 'Scan', icon: 'qrcode-scan', activeIcon: 'qrcode-scan' },
  { name: 'Recalls', label: 'Recalls', icon: 'shield-alert-outline', activeIcon: 'shield-alert' },
  { name: 'More', label: 'More', icon: 'dots-grid', activeIcon: 'dots-grid' },
];

/** Custom tab bar with a raised gradient Scan button in the centre. */
function TabBar({ state, navigation }: BottomTabBarProps) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { backgroundColor: c.tabBar, borderTopColor: c.border, paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        const tab = TABS.find((t) => t.name === route.name)!;
        const focused = state.index === index;
        const onPress = () => {
          haptic.tap();
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        if (route.name === 'Scan') {
          return (
            <Pressable key={route.key} onPress={onPress} style={styles.scanWrap} accessibilityRole="button" accessibilityLabel="Scan a medicine">
              <LinearGradient colors={[brand.blue, brand.green]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.scanBtn, { borderColor: c.tabBar }]}>
                <Icon name="qrcode-scan" size={28} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[styles.label, { color: focused ? c.primary : c.textMuted }]}>Scan</Text>
            </Pressable>
          );
        }
        return (
          <Pressable key={route.key} onPress={onPress} style={styles.item} accessibilityRole="button" accessibilityState={{ selected: focused }}>
            <View style={[styles.pill, focused && { backgroundColor: c.primarySoft }]}>
              <Icon name={focused ? tab.activeIcon : tab.icon} size={24} color={focused ? c.primary : c.textMuted} />
            </View>
            <Text style={[styles.label, { color: focused ? c.primary : c.textMuted }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(p) => <TabBar {...p} />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="Scan" component={ScannerScreen} />
      <Tab.Screen name="Recalls" component={RecallsScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

/** Opens the right screen for a notification's action URL (push taps and in-app). */
export function openActionUrl(actionUrl?: string) {
  if (!actionUrl || !navigationRef.isReady()) return;
  const tab = (screen: string) => navigationRef.navigate('Main', { screen });
  switch (actionUrl) {
    case '/inventory':
      return tab('Inventory');
    case '/recalls':
      return tab('Recalls');
    case '/transfers':
      return navigationRef.navigate('Transfers');
    case '/disposals':
      return navigationRef.navigate('Disposals');
    case '/notifications':
      return navigationRef.navigate('Notifications');
    case '/settings':
      return navigationRef.navigate('Settings');
    default:
      return navigationRef.navigate('Notifications');
  }
}

export default function AppNavigator() {
  const { c, isDark } = useTheme();
  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: { ...(isDark ? DarkTheme : DefaultTheme).colors, background: c.bg, card: c.surface, text: c.text, border: c.border, primary: c.primary },
  };

  useEffect(() => {
    // Push notification taps → open the related screen.
    const nav = { navigate: (screen: string) => openActionUrl(`/${screen.toLowerCase()}`) };
    try {
      firebaseMessagingService.listenNotificationOpened(nav);
    } catch {
      /* messaging not available (e.g. web preview) */
    }
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navTheme}
      onReady={() => {
        const nav = { navigate: (screen: string) => openActionUrl(`/${screen.toLowerCase()}`) };
        firebaseMessagingService.handleInitialNotification?.(nav)?.catch?.(() => undefined);
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="Main" component={Tabs} />
        <Stack.Screen name="InventoryDetail" component={InventoryDetailScreen} />
        <Stack.Screen name="QRCode" component={QRCodeScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="ScanResult" component={ScanResultScreen} options={{ animation: 'fade_from_bottom' }} />
        <Stack.Screen name="ScanHistory" component={ScanHistoryScreen} />
        <Stack.Screen name="RecallDetail" component={RecallDetailScreen} />
        <Stack.Screen name="Transfers" component={TransfersScreen} />
        <Stack.Screen name="TransferDetail" component={TransferDetailScreen} />
        <Stack.Screen name="CreateTransfer" component={CreateTransferScreen} options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
        <Stack.Screen name="Insights" component={InsightsScreen} />
        <Stack.Screen name="Assistant" component={AssistantScreen} />
        <Stack.Screen name="Analytics" component={AnalyticsScreen} />
        <Stack.Screen name="Disposals" component={DisposalsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8, alignItems: 'flex-end' },
  item: { flex: 1, alignItems: 'center', gap: 3 },
  pill: { paddingHorizontal: 16, paddingVertical: 4, borderRadius: 16 },
  label: { fontSize: 11, fontWeight: '700' },
  scanWrap: { flex: 1, alignItems: 'center', gap: 3 },
  scanBtn: { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center', marginTop: -30, borderWidth: 4, shadowColor: brand.blue, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
});

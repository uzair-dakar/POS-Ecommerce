import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeScreen } from '../features/home/screens/HomeScreen';
import { PlaceholderScreen } from '../components/layout/PlaceholderScreen';
import { colors, radii, shadows, spacing } from '../theme';
import { TabBarIcon } from './TabBarIcon';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MarketsScreen = () => <PlaceholderScreen title="All markets" />;
const OrdersScreen = () => <PlaceholderScreen title="Order history" />;
const AccountScreen = () => <PlaceholderScreen title="Your account" />;

const TAB_BAR_HEIGHT = 66;

export function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  // The bar floats, so it has to clear the gesture bar / nav buttons itself.
  const bottom = Math.max(insets.bottom, spacing.md);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [styles.tabBar, { bottom, height: TAB_BAR_HEIGHT }],
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIconStyle: styles.tabIcon,
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabBarIcon name="home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="MarketsTab"
        component={MarketsScreen}
        options={{
          title: 'Markets',
          tabBarIcon: ({ focused }) => <TabBarIcon name="store" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused }) => <TabBarIcon name="bag" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="AccountTab"
        component={AccountScreen}
        options={{
          title: 'Account',
          tabBarIcon: ({ focused }) => <TabBarIcon name="user" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderRadius: radii.xxl,
    borderTopWidth: 0,
    backgroundColor: colors.surface,
    ...shadows.floating,
  },
  tabItem: { paddingVertical: 0 },
  tabIcon: { flex: 0 },
  tabLabel: { fontSize: 11, fontWeight: '600', marginTop: spacing.xxs },
});

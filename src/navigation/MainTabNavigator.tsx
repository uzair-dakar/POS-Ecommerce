import React from 'react';
import { createBottomTabNavigator, type BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';

import { HomeScreen } from '../features/home/screens/HomeScreen';
import { AccountScreen } from '../features/account/screens/AccountScreen';
import { OrderHistoryScreen } from '../features/orders/screens/OrderHistoryScreen';
import { MarketsTabScreen } from '../features/merchants/screens/MarketsTabScreen';
import { colors, radii, shadows, spacing } from '../theme';
import { TabBarIcon } from './TabBarIcon';
import { TAB_BAR_SIDE_INSET, useTabBarMetrics } from './tabBarMetrics';
import type { IconName } from '../components/ui';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();


/**
 * Built once at module scope. Defining these inline in the navigator would
 * hand React a brand-new component type on every render, which remounts the
 * icon and throws away its state.
 */
const tabOptions = (title: string, icon: IconName): BottomTabNavigationOptions => ({
  title,
  tabBarIcon: ({ focused }) => <TabBarIcon name={icon} focused={focused} />,
});

const HOME_OPTIONS = tabOptions('Home', 'home');
const MARKETS_OPTIONS = tabOptions('Markets', 'store');
const ORDERS_OPTIONS = tabOptions('Orders', 'bag');
const ACCOUNT_OPTIONS = tabOptions('Account', 'user');

export function MainTabNavigator() {
  const { bottom, height } = useTabBarMetrics();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [styles.tabBar, { bottom, height }],
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIconStyle: styles.tabIcon,
      }}>
      <Tab.Screen name="HomeTab" component={HomeScreen} options={HOME_OPTIONS} />
      <Tab.Screen name="MarketsTab" component={MarketsTabScreen} options={MARKETS_OPTIONS} />
      <Tab.Screen name="OrdersTab" component={OrderHistoryScreen} options={ORDERS_OPTIONS} />
      <Tab.Screen name="AccountTab" component={AccountScreen} options={ACCOUNT_OPTIONS} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    // Margin, not left/right: the navigator positions the bar itself and
    // overrides those.
    marginHorizontal: TAB_BAR_SIDE_INSET,
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

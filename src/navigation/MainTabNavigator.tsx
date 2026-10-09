import React, { useCallback, useMemo } from 'react';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { HomeScreen } from '../features/home/screens/HomeScreen';
import { AccountScreen } from '../features/account/screens/AccountScreen';
import { OrderHistoryScreen } from '../features/orders/screens/OrderHistoryScreen';
import { MarketsTabScreen } from '../features/merchants/screens/MarketsTabScreen';
import { useGetOrdersQuery } from '../features/orders/api/ordersApi';
import { isOrderLive } from '../features/orders/orderStatus';
import { selectBasketSummary } from '../features/basket/basketSlice';
import { useAppSelector } from '../store/hooks';
import { GlassTabBar, type TabItem } from './GlassTabBar';
import type { MainTabParamList, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Labels and glyphs live here, next to the routes they belong to — the tab bar
 * itself stays a presentation component that knows nothing about this app's
 * navigation.
 */
const TAB_ITEMS: Record<keyof MainTabParamList, TabItem> = {
  HomeTab: { label: 'Home', icon: 'home' },
  MarketsTab: { label: 'Markets', icon: 'store' },
  OrdersTab: { label: 'Orders', icon: 'bag' },
  AccountTab: { label: 'Account', icon: 'user' },
};

export function MainTabNavigator() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { itemCount } = useAppSelector(selectBasketSummary);

  // The bar shows orders in flight, so it has to watch the same data the
  // Orders screen does. RTK Query hands back the one cached result either way.
  const { data: orders } = useGetOrdersQuery();
  const liveOrderCount = useMemo(
    () => (orders ?? []).filter(order => isOrderLive(order.status)).length,
    [orders],
  );

  const items = useMemo<Record<string, TabItem>>(
    () => ({
      ...TAB_ITEMS,
      OrdersTab: { ...TAB_ITEMS.OrdersTab, badgeCount: liveOrderCount },
    }),
    [liveOrderCount],
  );

  const openBasket = useCallback(() => navigation.navigate('Basket'), [navigation]);

  const renderTabBar = useCallback(
    (props: BottomTabBarProps) => (
      <GlassTabBar
        {...props}
        items={items}
        basket={{ count: itemCount, onPress: openBasket }}
      />
    ),
    [items, itemCount, openBasket],
  );

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={renderTabBar}>
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="MarketsTab" component={MarketsTabScreen} />
      <Tab.Screen name="OrdersTab" component={OrderHistoryScreen} />
      <Tab.Screen name="AccountTab" component={AccountScreen} />
    </Tab.Navigator>
  );
}

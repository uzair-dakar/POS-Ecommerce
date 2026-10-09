import React from 'react';
import { NavigationContainer, DefaultTheme, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { selectIsAuthenticated } from '../features/auth/authSlice';
import { useAppSelector } from '../store/hooks';
import { colors } from '../theme';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import type { RootStackParamList } from './types';

import { ChainScreen } from '../features/merchants/screens/ChainScreen';
import { ChainsScreen } from '../features/merchants/screens/ChainsScreen';
import { MerchantScreen } from '../features/merchants/screens/MerchantScreen';
import { PopularItemsScreen } from '../features/merchants/screens/PopularItemsScreen';
import { MerchantListScreen } from '../features/merchants/screens/MerchantListScreen';
import { ProductScreen } from '../features/merchants/screens/ProductScreen';
import { SearchScreen } from '../features/search/screens/SearchScreen';
import { AddressesScreen } from '../features/account/screens/AddressesScreen';
import { BasketScreen } from '../features/basket/screens/BasketScreen';
import { CheckoutScreen } from '../features/orders/screens/CheckoutScreen';
import { OrderConfirmationScreen } from '../features/orders/screens/OrderConfirmationScreen';
import { OrderDetailScreen } from '../features/orders/screens/OrderDetailScreen';
import { OrderTrackingScreen } from '../features/orders/screens/OrderTrackingScreen';
import { ReservationDateTimeScreen } from '../features/reservations/screens/ReservationDateTimeScreen';
import { ReservationDetailsScreen } from '../features/reservations/screens/ReservationDetailsScreen';
import { ReservationConfirmedScreen } from '../features/reservations/screens/ReservationConfirmedScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Navigation's own theme, driven by the same design tokens as the app. */
const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

/**
 * Which world the user is in. The splash that covers rehydration is handled a
 * level up by PersistGate, so by the time this renders the stored session —
 * if there is one — has already been read back.
 */
export function RootNavigator() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return (
    <NavigationContainer theme={navigationTheme}>
      {isAuthenticated ? <SignedInStack /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

/**
 * Everything behind sign-in. Swapping navigators rather than navigating means
 * signing out unmounts the whole tree — no signed-in screen can survive in
 * the back stack, and no "go back into the app" gesture can reach one.
 */
function SignedInStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // Native stack animations run on the UI thread — no JS-driven jank.
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Main" component={MainTabNavigator} />

      <Stack.Screen
        name="Search"
        component={SearchScreen}
        // No slide: the search field should feel like it was already there.
        options={{ animation: 'fade' }}
      />
      <Stack.Screen name="Chains" component={ChainsScreen} />
      <Stack.Screen name="Chain" component={ChainScreen} />
      <Stack.Screen name="MerchantList" component={MerchantListScreen} />
      <Stack.Screen name="Merchant" component={MerchantScreen} />
      <Stack.Screen name="PopularItems" component={PopularItemsScreen} />
      <Stack.Screen
        name="Product"
        component={ProductScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />

      <Stack.Screen name="Basket" component={BasketScreen} />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        // No back gesture mid-payment: leaving would strand a placed order.
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen
        name="OrderConfirmation"
        component={OrderConfirmationScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />

      <Stack.Screen name="ReservationDateTime" component={ReservationDateTimeScreen} />
      <Stack.Screen name="ReservationDetails" component={ReservationDetailsScreen} />
      <Stack.Screen
        name="ReservationConfirmed"
        component={ReservationConfirmedScreen}
        options={{ gestureEnabled: false, animation: 'fade' }}
      />

      <Stack.Screen
        name="Addresses"
        component={AddressesScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}

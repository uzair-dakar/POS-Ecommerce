import React from 'react';
import { NavigationContainer, DefaultTheme, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../theme';
import { MainTabNavigator } from './MainTabNavigator';
import type { RootStackParamList } from './types';

import { PlaceholderScreen } from '../components/layout/PlaceholderScreen';
import { OnboardingScreen } from '../features/auth/screens/OnboardingScreen';
import { SignInScreen } from '../features/auth/screens/SignInScreen';
import { SignUpScreen } from '../features/auth/screens/SignUpScreen';

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

const ForgotPasswordScreen = () => (
  <PlaceholderScreen
    title="Reset your password"
    note="We'll email you a link to choose a new one."
  />
);

/**
 * One stack for the whole session.
 *
 * The app opens straight onto the feed: browsing a storefront needs no
 * account, so there is no signed-out world to swap in. Signing in is a sheet
 * raised over whatever the user was doing — and dismissed back to it — which
 * is also why signing out leaves them where they are instead of ejecting them
 * to a welcome screen.
 */
export function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <AppStack />
    </NavigationContainer>
  );
}

function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // Native stack animations run on the UI thread — no JS-driven jank.
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Main" component={MainTabNavigator} />

      <Stack.Group screenOptions={{ presentation: 'modal', animation: 'slide_from_bottom' }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </Stack.Group>

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

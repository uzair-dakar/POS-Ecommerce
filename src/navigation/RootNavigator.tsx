import React from 'react';
import { NavigationContainer, DefaultTheme, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PlaceholderScreen } from '../components/layout/PlaceholderScreen';
import { colors } from '../theme';
import { MainTabNavigator } from './MainTabNavigator';
import type { RootStackParamList } from './types';

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

const Stub = (title: string) => () => <PlaceholderScreen title={title} />;

export function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          // Native stack animations run on the UI thread — no JS-driven jank.
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="Main" component={MainTabNavigator} />

        <Stack.Screen name="Search" component={Stub('Search')} />
        <Stack.Screen name="Chains" component={Stub('Brands you love')} />
        <Stack.Screen name="Chain" component={Stub('Brand locations')} />
        <Stack.Screen name="MerchantList" component={Stub('All stores')} />
        <Stack.Screen name="Merchant" component={Stub('Store')} />
        <Stack.Screen
          name="Product"
          component={Stub('Product')}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />

        <Stack.Screen name="Basket" component={Stub('Your basket')} />
        <Stack.Screen name="Checkout" component={Stub('Checkout')} />
        <Stack.Screen name="OrderConfirmation" component={Stub("You're all set!")} />
        <Stack.Screen name="OrderTracking" component={Stub('Live order')} />
        <Stack.Screen name="OrderDetail" component={Stub('Order detail')} />

        <Stack.Screen name="ReservationDateTime" component={Stub('Reservation')} />
        <Stack.Screen name="ReservationDetails" component={Stub('Reservation details')} />
        <Stack.Screen name="ReservationConfirmed" component={Stub("You're on the list")} />

        <Stack.Screen
          name="Addresses"
          component={Stub('Delivery address')}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

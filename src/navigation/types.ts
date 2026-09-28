import type { NavigatorScreenParams } from '@react-navigation/native';
import type { ChainId, MerchantId, MerchantKind, OrderId, ProductId } from '../types';

/** Bottom tabs — the four persistent destinations from the design. */
export type MainTabParamList = {
  HomeTab: undefined;
  MarketsTab: undefined;
  OrdersTab: undefined;
  AccountTab: undefined;
};

/**
 * Every route and its params in one place. Screens read their params through
 * these types, so a renamed route or param fails at compile time rather than
 * silently navigating nowhere.
 */
export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;

  // Discovery
  Search: undefined;
  Chains: undefined;
  Chain: { chainId: ChainId };
  MerchantList: { kind: MerchantKind };
  Merchant: { merchantId: MerchantId };
  Product: { merchantId: MerchantId; productId: ProductId };

  // Ordering
  Basket: undefined;
  Checkout: undefined;
  OrderConfirmation: { orderId: OrderId };
  OrderTracking: { orderId: OrderId };
  OrderDetail: { orderId: OrderId };

  // Reservations
  ReservationDateTime: { merchantId: MerchantId };
  ReservationDetails: { merchantId: MerchantId };
  ReservationConfirmed: { reservationNumber: string };

  // Account
  Addresses: undefined;
};

/** Makes `navigation.navigate` fully typed without importing the list everywhere. */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

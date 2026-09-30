import type { NavigatorScreenParams } from '@react-navigation/native';
import type {
  ChainId,
  MerchantId,
  MerchantKind,
  OrderId,
  ProductId,
  SeatingKind,
} from '../types';

/** The signed-out world. Mounted instead of the root stack, never inside it. */
export type AuthStackParamList = {
  Onboarding: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

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

  // Reservations. Each step carries forward what the previous one collected,
  // so the flow has no hidden shared state and any step can be deep-linked.
  ReservationDateTime: { merchantId: MerchantId };
  ReservationDetails: {
    merchantId: MerchantId;
    date: string;
    time: string;
    guests: number;
    seating: SeatingKind;
  };
  ReservationConfirmed: {
    reservationNumber: string;
    merchantId: MerchantId;
    merchantName?: string;
    date: string;
    time: string;
    guests: number;
    seatingName: string;
  };

  // Account
  Addresses: undefined;
};

/**
 * Makes `navigation.navigate` fully typed without importing the list
 * everywhere. Both stacks are listed because only one of them is mounted at a
 * time — the auth stack before sign-in, the root stack after.
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList, AuthStackParamList {}
  }
}

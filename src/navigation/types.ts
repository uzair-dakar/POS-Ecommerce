import type { NavigatorScreenParams } from '@react-navigation/native';
import type {
  CategoryId,
  ChainId,
  MerchantId,
  MerchantKind,
  OrderId,
  ProductId,
  SeatingKind,
} from '../types';

/**
 * The auth routes. They are part of the root stack and presented over the
 * app, because browsing never requires an account — only ordering does.
 */
export type AuthStackParamList = Pick<
  RootStackParamList,
  'Onboarding' | 'SignIn' | 'SignUp' | 'ForgotPassword'
>;

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

  // Account. Presented over whatever the user was doing, so signing in from
  // a basket returns to that basket rather than restarting the app.
  Onboarding: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;

  // Discovery
  Search: undefined;
  Chains: undefined;
  Chain: { chainId: ChainId };
  MerchantList: { kind: MerchantKind; categoryId?: CategoryId };
  Merchant: { merchantId: MerchantId };
  PopularItems: { merchantId: MerchantId };
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
 * everywhere. One stack is mounted for the whole session; the auth routes are
 * part of it.
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

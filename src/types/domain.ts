import type { Money } from '../utils/format';

/** Branded ids stop a MerchantId ever being passed where a ProductId belongs. */
type Brand<T, B extends string> = T & { readonly __brand: B };

export type MerchantId = Brand<string, 'MerchantId'>;
export type ProductId = Brand<string, 'ProductId'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type ChainId = Brand<string, 'ChainId'>;
export type OrderId = Brand<string, 'OrderId'>;

export type MerchantKind = 'restaurant' | 'market';

export type Category = {
  id: CategoryId;
  name: string;
  imageUrl: string;
};

export type Merchant = {
  id: MerchantId;
  kind: MerchantKind;
  name: string;
  tagline: string;
  imageUrl: string;
  logoUrl?: string;
  rating: number;
  deliveryFee: Money;
  deliveryMinMinutes: number;
  deliveryMaxMinutes: number;
  minOrder: Money;
  isOpen: boolean;
  closesAt?: string;
  /** e.g. "20% off", "3 for 2 · Summer" — rendered as a corner badge. */
  offerLabel?: string;
  tags: readonly string[];
};

/** A multi-location brand such as KFC — drills into a locations list. */
export type Chain = {
  id: ChainId;
  name: string;
  logoUrl: string;
  locationCount: number;
};

export type Promotion = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  ctaLabel: string;
  imageUrl: string;
  /** Where tapping the card should take the user. */
  target: { type: 'merchant'; id: MerchantId } | { type: 'category'; id: CategoryId };
};

export type Product = {
  id: ProductId;
  merchantId: MerchantId;
  name: string;
  description: string;
  imageUrl: string;
  price: Money;
  /** Set when the item is discounted; `price` is always what the user pays. */
  originalPrice?: Money;
  unitLabel?: string;
  isPopular: boolean;
};

/** One assembled slice of the home feed. Order comes from the server. */
export type HomeFeed = {
  deliverTo: string;
  categories: readonly Category[];
  heroPromotions: readonly Promotion[];
  quickPromotions: readonly Promotion[];
  brands: readonly Chain[];
  popularRestaurants: readonly Merchant[];
  fastestDelivery: readonly Merchant[];
  markets: readonly Merchant[];
};

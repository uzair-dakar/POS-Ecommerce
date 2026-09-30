import type { Money } from '../utils/format';

/** Branded ids stop a MerchantId ever being passed where a ProductId belongs. */
type Brand<T, B extends string> = T & { readonly __brand: B };

export type MerchantId = Brand<string, 'MerchantId'>;
export type ProductId = Brand<string, 'ProductId'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type ChainId = Brand<string, 'ChainId'>;
export type OrderId = Brand<string, 'OrderId'>;
export type OptionGroupId = Brand<string, 'OptionGroupId'>;
export type OptionId = Brand<string, 'OptionId'>;
export type SectionId = Brand<string, 'SectionId'>;

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
  /**
   * Comparison price per `unitLabel` — "€0.30/pc" for a 12-pack costing €3.55.
   * The server computes it: it depends on pack size, which the app does not
   * model, so deriving it here would be guesswork.
   */
  unitPrice?: Money;
  unitLabel?: string;
  isPopular: boolean;
};

/* ------------------------------ menus ---------------------------------- */

export type ProductOption = {
  id: OptionId;
  name: string;
  /** Added to the base price; 0 for the default choice. */
  priceDelta: Money;
  isAvailable: boolean;
};

/**
 * One block of choices on a product — "Size", "Extra toppings".
 *
 * `minSelections` drives the Required/Optional badge and whether the item can
 * be added at all; `maxSelections` of 1 renders radios, more renders
 * checkboxes. The server owns these rules so the app never hard-codes a menu.
 */
export type ProductOptionGroup = {
  id: OptionGroupId;
  name: string;
  minSelections: number;
  maxSelections: number;
  options: readonly ProductOption[];
};

/** A named run of products inside a merchant — "Most ordered", "Burgers". */
export type MenuSection = {
  id: SectionId;
  name: string;
  products: readonly Product[];
};

export type Offer = {
  id: string;
  kind: 'discount' | 'gift';
  title: string;
  detail: string;
};

/** Everything a merchant screen needs, in one request. */
export type MerchantDetail = {
  merchant: Merchant;
  offers: readonly Offer[];
  sections: readonly MenuSection[];
  /** Restaurants only — drives the "Book table" control. */
  acceptsReservations: boolean;
  supportsPickup: boolean;
  pickupMinMinutes: number;
  pickupMaxMinutes: number;
  address: string;
};

/** A branch of a chain, as listed on the brand screen. */
export type ChainLocation = {
  merchant: Merchant;
  address: string;
};

export type ChainDetail = {
  chain: Chain;
  heroImageUrl: string;
  description: string;
  locations: readonly ChainLocation[];
};

/* ------------------------------ orders --------------------------------- */

export type OrderStatus =
  | 'placed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type OrderEvent = {
  status: OrderStatus;
  /** "19:02" — already localised by the server. */
  at: string;
};

export type OrderLine = {
  productId: ProductId;
  name: string;
  imageUrl: string;
  quantity: number;
  /** Line total, i.e. unit price including options × quantity. */
  total: Money;
  optionsSummary?: string;
};

export type Rider = {
  name: string;
  initials: string;
  phone: string;
};

export type Order = {
  id: OrderId;
  reference: string;
  merchantId: MerchantId;
  merchantName: string;
  merchantImageUrl: string;
  placedOn: string;
  status: OrderStatus;
  lines: readonly OrderLine[];
  timeline: readonly OrderEvent[];
  subtotal: Money;
  deliveryFee: Money;
  vat: Money;
  total: Money;
  deliveryAddress: string;
  paymentLabel: string;
  /** Present while the order is live. */
  etaMinutes?: number;
  rider?: Rider;
};

/* --------------------------- reservations ------------------------------ */

export type SeatingKind = 'standard' | 'outdoor' | 'high_top' | 'counter';

export type SeatingOption = {
  kind: SeatingKind;
  name: string;
  description: string;
  isAvailable: boolean;
};

export type ReservationSlot = {
  /** "19:30" in 24h; the UI formats it for display. */
  time: string;
  isAvailable: boolean;
};

export type ReservationAvailability = {
  merchantId: MerchantId;
  merchantName: string;
  slots: readonly ReservationSlot[];
  seating: readonly SeatingOption[];
  maxGuests: number;
};

export type Reservation = {
  reference: string;
  merchantName: string;
  merchantImageUrl: string;
  /** ISO date, "2026-09-15". */
  date: string;
  time: string;
  guests: number;
  seating: SeatingKind;
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

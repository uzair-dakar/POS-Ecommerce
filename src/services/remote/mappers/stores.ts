import type {
  Category,
  CategoryId,
  Chain,
  ChainDetail,
  ChainId,
  ChainLocation,
  HomeFeed,
  Merchant,
  MerchantId,
  MerchantKind,
} from '../../../types';
import type { OutletDto, StoreDto } from '../dto';
import {
  CATEGORY_TILES,
  HERO_PROMOTIONS,
  MARKET_PLACEHOLDER_IMAGES,
  MERCHANT_PLACEHOLDER_IMAGES,
  QUICK_PROMOTIONS,
  RESTAURANT_BUSINESS_TYPES,
} from '../staticContent';
import { encodeMerchantId, pickStable, text, toMoney } from './common';

/**
 * Turns the backend's store/outlet records into the storefront's merchants.
 *
 * The API models a business and its branches; the app models a place you can
 * order from, which is a branch. Everything that shapes a merchant card but
 * the API does not return yet — rating, delivery window, fees — is defaulted
 * here and marked, so there is one place to delete when it starts arriving.
 */

/** Defaults standing in for fields the storefront API does not return yet. */
const DEFAULTS = {
  rating: 4.8,
  deliveryMinMinutes: 20,
  deliveryMaxMinutes: 30,
  deliveryFee: toMoney(0),
  minOrder: toMoney(10),
  closesAt: '23:00',
} as const;

/**
 * Anything not known to be a food business is browsed as a market: a product
 * grid renders a catalogue of any kind sensibly, while a menu layout does not.
 */
export const kindForBusinessType = (businessTypeID: number | undefined): MerchantKind =>
  RESTAURANT_BUSINESS_TYPES.includes(Number(businessTypeID)) ? 'restaurant' : 'market';

const isOpenOutlet = (outlet: OutletDto) => outlet.isActive !== false && outlet.isDelete !== true;

export function mapOutletToMerchant(store: StoreDto, outlet: OutletDto): Merchant {
  const businessTypeID = Number(store.businessTypeID ?? 0);
  const kind = kindForBusinessType(businessTypeID);

  const id = encodeMerchantId({
    businessTypeID,
    storeRequestID: Number(store.storeRequestID ?? store.storeID ?? 0),
    outletID: Number(outlet.storeOutletID ?? 0),
  }) as MerchantId;

  const storeName = text(store.storeName, 'Store');
  const outletName = text(outlet.outletName);
  const city = text(outlet.storeCityName);

  return {
    id,
    kind,
    // A single-outlet business reads better as just its name.
    name: outletName && outletName !== 'Main Outlet' ? `${storeName} ${city || outletName}`.trim() : storeName,
    tagline: text(outlet.storeAddress, city || 'Delivering near you'),
    imageUrl: pickStable(
      kind === 'market' ? MARKET_PLACEHOLDER_IMAGES : MERCHANT_PLACEHOLDER_IMAGES,
      id,
    ),
    rating: DEFAULTS.rating,
    deliveryFee: DEFAULTS.deliveryFee,
    deliveryMinMinutes: DEFAULTS.deliveryMinMinutes,
    deliveryMaxMinutes: DEFAULTS.deliveryMaxMinutes,
    minOrder: DEFAULTS.minOrder,
    isOpen: isOpenOutlet(outlet),
    closesAt: DEFAULTS.closesAt,
    tags: city ? [city] : [],
  };
}

/** Every orderable outlet across every store, flattened. */
export function mapStoresToMerchants(stores: readonly StoreDto[]): Merchant[] {
  return stores.flatMap(store =>
    (store.outlets ?? []).filter(isOpenOutlet).map(outlet => mapOutletToMerchant(store, outlet)),
  );
}

/* ------------------------------- chains -------------------------------- */

/** A store with more than one branch is a brand on the storefront. */
const hasMultipleOutlets = (store: StoreDto) => (store.outlets ?? []).length > 1;

export const chainIdFor = (store: StoreDto): ChainId =>
  String(store.storeRequestID ?? store.storeID ?? '') as ChainId;

export function mapStoreToChain(store: StoreDto): Chain {
  return {
    id: chainIdFor(store),
    name: text(store.storeName, 'Brand'),
    logoUrl: pickStable(MERCHANT_PLACEHOLDER_IMAGES, String(store.storeRequestID ?? '')),
    locationCount: (store.outlets ?? []).length || Number(store.totalOutlets ?? 0),
  };
}

export const mapStoresToChains = (stores: readonly StoreDto[]): Chain[] =>
  stores.filter(hasMultipleOutlets).map(mapStoreToChain);

const MAIN_OUTLET = 'Main Outlet';

export function mapStoreToChainDetail(store: StoreDto): ChainDetail {
  const locations: ChainLocation[] = (store.outlets ?? []).map(outlet => {
    const outletName = text(outlet.outletName, MAIN_OUTLET);

    return {
      merchant: mapOutletToMerchant(store, outlet),
      name: outletName,
      // Most outlets carry no address yet, and a blank line under a branch
      // name reads as a loading failure — the storefront's own fallback goes
      // here instead.
      address: text(outlet.storeAddress, text(outlet.storeCityName, 'Great food, made for your day.')),
      tag: outletName === MAIN_OUTLET ? 'Main outlet' : undefined,
    };
  });

  return {
    chain: mapStoreToChain(store),
    heroImageUrl: pickStable(MERCHANT_PLACEHOLDER_IMAGES, String(store.storeRequestID ?? '')),
    description:
      'Discover nearby locations, compare delivery times and find the perfect spot for your next order.',
    locations,
  };
}

/* ------------------------------ home feed ------------------------------ */

/**
 * Assembles the home feed from one stores call.
 *
 * The rows are a presentation choice, not something the API ranks yet: the
 * fastest row is simply the openest, shortest-window merchants first.
 */
/**
 * The rail is the storefront's own fixed set, not a summary of what came back
 * — the same fourteen tiles in the same order as the web client, so a shopper
 * finds the row where they left it whichever client they open. A tile whose
 * business type has no stores today simply lands on an empty list.
 */
const categories: readonly Category[] = CATEGORY_TILES.map(tile => ({
  id: String(tile.businessTypeID) as CategoryId,
  slug: tile.slug,
  name: tile.name,
  kind: kindForBusinessType(tile.businessTypeID),
}));

export function buildHomeFeed(stores: readonly StoreDto[], deliverTo: string): HomeFeed {
  const merchants = mapStoresToMerchants(stores);
  const restaurants = merchants.filter(merchant => merchant.kind === 'restaurant');
  const markets = merchants.filter(merchant => merchant.kind === 'market');

  const fastest = [...merchants]
    .filter(merchant => merchant.isOpen)
    .sort((a, b) => a.deliveryMaxMinutes - b.deliveryMaxMinutes)
    .slice(0, 8);

  /**
   * Popular, dinner and offers are four headings over one pool: the catalogue
   * ranks nothing and carries no offers, so each row is an ordering, not a
   * selection. They differ so the feed does not read as the same row four
   * times, and each becomes a real query the day the backend can rank.
   */
  const byName = (a: Merchant, b: Merchant) => a.name.localeCompare(b.name);
  const dinner = restaurants.filter(merchant => merchant.isOpen).sort(byName).slice(0, 10);
  const offers = [...restaurants].sort((a, b) => byName(b, a)).slice(0, 10);

  return {
    deliverTo,
    categories,
    heroPromotions: HERO_PROMOTIONS,
    quickPromotions: QUICK_PROMOTIONS,
    brands: mapStoresToChains(stores),
    popularRestaurants: restaurants.slice(0, 10),
    fastestDelivery: fastest,
    dinner,
    offers,
    markets: markets.slice(0, 10),
  };
}

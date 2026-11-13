/**
 * Content and classification the storefront needs but the backend does not
 * serve yet.
 *
 * Keeping it here — rather than inside a mapper or a screen — makes the gap
 * obvious: every entry is a candidate for deletion the day an endpoint can
 * supply it.
 *
 * The tiles, rows and copy below are the ones the web storefront
 * (order.dakarpos.com) ships, so both clients offer the same storefront. Only
 * the artwork differs in form: the app bundles it instead of fetching it, and
 * resolves it by slug in src/features/home/categoryArt.ts.
 */
import type { CategoryId, Promotion } from '../../types';

/**
 * Business types whose outlets are ordered from like a restaurant — a menu
 * with sections — rather than shopped like a market's product grid.
 *
 * 20 is Restaurant and 4 is Cafe & Food Truck, per Storefront/GetBusinessTypes.
 * Nothing in the API states this, so it stays the one place the app decides
 * it — but it is now decided from the real list rather than from guesses.
 * Type 1, which the web client treats as restaurants, is in fact Adult.
 */
export const RESTAURANT_BUSINESS_TYPES: readonly number[] = [4, 20];

const image = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=400&q=80&auto=format&fit=crop`;

export type CategoryTile = {
  /** Unique key for the tile. */
  slug: string;
  name: string;
  businessTypeID: number;
};

/**
 * The category rail, in the storefront's order.
 *
 * The ids are the tenant's real business types, from
 * Storefront/GetBusinessTypes — an endpoint the backend now serves, which ends
 * the guesswork the web client still carries. Its map was wrong almost
 * everywhere: it sent Restaurants to 1, which is Adult, and Beauty to 4, which
 * is Cafe & Food Truck.
 *
 * Where the storefront's wording differs from the backend's, the tile keeps
 * the storefront's — "Drinks" over "Liquor Stores & Bottle Shop" — because a
 * rail is shop windows, not a taxonomy. Two tiles have no type of their own
 * and borrow the nearest.
 */
export const CATEGORY_TILES: readonly CategoryTile[] = [
  { slug: 'restaurants', name: 'Restaurants', businessTypeID: 20 },
  { slug: 'groceries', name: 'Groceries', businessTypeID: 13 },
  { slug: 'health', name: 'Health', businessTypeID: 15 },
  { slug: 'beauty', name: 'Beauty', businessTypeID: 2 },
  { slug: 'drinks', name: 'Drinks', businessTypeID: 18 },
  { slug: 'pet-supply', name: 'Pet Supply', businessTypeID: 19 },
  { slug: 'electronics', name: 'Electronics', businessTypeID: 7 },
  // No Kids & Baby type; Toys, Hobbies & Crafts is the nearest shelf.
  { slug: 'kids-baby', name: 'Kids & Baby', businessTypeID: 28 },
  // Spans Homeware (16) and Tools & Hardware (26); Homeware is the bigger half.
  { slug: 'home-diy', name: 'Home & DIY', businessTypeID: 16 },
  { slug: 'flowers', name: 'Flowers', businessTypeID: 9 },
  { slug: 'fitness', name: 'Fitness', businessTypeID: 23 },
  { slug: 'fashion', name: 'Fashion', businessTypeID: 8 },
  { slug: 'gifts', name: 'Gifts', businessTypeID: 12 },
  { slug: 'adults', name: 'Adults', businessTypeID: 1 },
];

/** Marketing slots are app-owned until the backend has a campaigns endpoint. */
export const HERO_PROMOTIONS: readonly Promotion[] = [
  {
    id: 'hero_first_order',
    eyebrow: 'First order treat',
    title: 'Get it warm.\nGet it now.',
    // The web's line runs to three lines on a phone and gets cut mid-word;
    // this is the same promise at a length that lands in two.
    subtitle: 'Every kitchen and corner store on your street, in under 30 minutes.',
    ctaLabel: 'Start an order',
    imageUrl: image('1565299624946-b28f40a0ae38'),
    target: { type: 'category', id: '20' as CategoryId },
  },
];

export const QUICK_PROMOTIONS: readonly Promotion[] = [
  {
    id: 'quick_groceries',
    eyebrow: 'Fresh today',
    title: 'Groceries\nat your door',
    ctaLabel: 'Shop groceries',
    imageUrl: image('1542838132-92c53300491e'),
    target: { type: 'category', id: '13' as CategoryId },
  },
  {
    id: 'quick_dinner',
    eyebrow: 'Dinner time',
    title: 'Dinner\nsorted',
    ctaLabel: 'Order now',
    imageUrl: image('1504674900247-0877df9cc836'),
    target: { type: 'category', id: '20' as CategoryId },
  },
];

/** Storefront photography is not in the API; these stand in, chosen stably. */
export const MERCHANT_PLACEHOLDER_IMAGES: readonly string[] = [
  image('1517248135467-4c7edcad34c4'),
  image('1555396273-367ea4eb4db5'),
  image('1552566626-52f8b828add9'),
  image('1414235077428-338989a2e8c0'),
  image('1466978913421-dad2ebd01d17'),
];

export const MARKET_PLACEHOLDER_IMAGES: readonly string[] = [
  image('1542838132-92c53300491e'),
  image('1610832958506-aa56368176cf'),
  image('1534723452862-4c874018d66d'),
];

export const PRODUCT_PLACEHOLDER_IMAGE = image('1504674900247-0877df9cc836');

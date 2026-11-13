import type { ReactVideoSource } from 'react-native-video';

/**
 * Everything the home feed draws that the API does not serve: the fixed
 * tiles' artwork, their plates, and the two grids whose contents are a
 * storefront choice rather than a query.
 *
 * The same photographs the web storefront uses, bundled rather than fetched:
 * these tiles are the first thing on the screen, and a rail of empty plates
 * that fills in a beat later is the one place a placeholder is most visible.
 * Bundling also keeps the mapping out of the service layer — which artwork a
 * slug wears is a presentation choice, so it lives here with the components
 * that draw it, keyed by the slug the feed already carries.
 */

export const CATEGORY_ART: Record<string, number> = {
  restaurants: require('../../assets/images/categories/restaurant.jpg'),
  groceries: require('../../assets/images/categories/groceries.jpg'),
  health: require('../../assets/images/categories/health.jpg'),
  beauty: require('../../assets/images/categories/beauty.jpg'),
  drinks: require('../../assets/images/categories/drinks.jpg'),
  'pet-supply': require('../../assets/images/categories/pet-supply.jpg'),
  electronics: require('../../assets/images/categories/electronics.jpg'),
  'kids-baby': require('../../assets/images/categories/kids-baby.jpg'),
  'home-diy': require('../../assets/images/categories/home.jpg'),
  flowers: require('../../assets/images/categories/flowers.jpg'),
  fitness: require('../../assets/images/categories/fitness.jpg'),
  fashion: require('../../assets/images/categories/fashion.jpg'),
  gifts: require('../../assets/images/categories/gifts.jpg'),
  adults: require('../../assets/images/categories/adults.jpg'),
};

/** The Essentials grid's product renders, which need a transparent ground. */
export const ESSENTIAL_ART: Record<string, number> = {
  supermarkets: require('../../assets/images/categories/esen2.png'),
  'school-essentials': require('../../assets/images/categories/esen1.png'),
  'essential-offers': require('../../assets/images/categories/esen3.png'),
  'essential-electronics': require('../../assets/images/categories/esen1.png'),
  wellness: require('../../assets/images/categories/esen4.png'),
  toys: require('../../assets/images/categories/esen1.png'),
};

/**
 * The pastel plate behind each tile's photograph, as the web storefront
 * assigns it. It shows while the art decodes and through the art's lighter
 * edges, which is what stops the rail reading as a strip of grey squares.
 */
export const CATEGORY_TINT: Record<string, string> = {
  restaurants: '#FBE4E9',
  groceries: '#E7F0E1',
  health: '#E3EEF5',
  beauty: '#F3E6F0',
  drinks: '#F1E3EA',
  'pet-supply': '#EFE7DA',
  electronics: '#E5E7F2',
  'kids-baby': '#FDE8E3',
  'home-diy': '#F6EAD2',
  flowers: '#F0E5F0',
  fitness: '#E1EDE9',
  fashion: '#EAE7F5',
  gifts: '#F1E3EA',
  adults: '#FDECD1',
};

/** Fallback for a tile the storefront has not assigned a plate to. */
export const DEFAULT_CATEGORY_TINT = '#F5F5F2';

/**
 * The "Essentials" grid — shortcuts straight into a business type's shops.
 *
 * Carried over from the web storefront, artwork included. Not part of the
 * home feed: nothing about these six comes from the catalogue, so they stay
 * out of the mapper and the gateway.
 *
 * Four map onto real business types (Storefront/GetBusinessTypes): 13
 * Groceries & Food Retail, 7 Electronics, 15 Health, 28 Toys, Hobbies &
 * Crafts. "School essentials" and "Offers" describe no type the tenant has —
 * they keep the web storefront's ids so both clients land in the same place,
 * and both want a real home once the backend has one.
 */
export type EssentialTile = {
  slug: string;
  name: string;
  businessTypeID: number;
  art: number;
};

export const ESSENTIAL_TILES: readonly EssentialTile[] = [
  { slug: 'supermarkets', name: 'Supermarkets', businessTypeID: 13, art: ESSENTIAL_ART.supermarkets },
  {
    slug: 'school-essentials',
    name: 'School essentials',
    businessTypeID: 23,
    art: ESSENTIAL_ART['school-essentials'],
  },
  {
    slug: 'essential-offers',
    name: 'Offers',
    businessTypeID: 29,
    art: ESSENTIAL_ART['essential-offers'],
  },
  {
    slug: 'essential-electronics',
    name: 'Electronics',
    businessTypeID: 7,
    art: ESSENTIAL_ART['essential-electronics'],
  },
  { slug: 'wellness', name: 'Wellness', businessTypeID: 15, art: ESSENTIAL_ART.wellness },
  { slug: 'toys', name: 'Toys', businessTypeID: 28, art: ESSENTIAL_ART.toys },
];

/**
 * The "Categories" grid of dishes.
 *
 * Browsing by dish is not something the catalogue supports — a store carries
 * no cuisine field — so these are the storefront's own tiles, counts and all,
 * and tapping one lands on the restaurant list.
 */
const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=400&q=80&auto=format&fit=crop`;

export type DishCategory = { name: string; count: string; imageUrl: string };

export const DISH_CATEGORIES: readonly DishCategory[] = [
  { name: 'Street food', count: '3 places', imageUrl: unsplash('1509722747041-616f39b57569') },
  { name: 'Pizza', count: '27 places', imageUrl: unsplash('1565299624946-b28f40a0ae38') },
  { name: 'Burgers', count: '18 places', imageUrl: unsplash('1568901346375-23c9450c58cd') },
  { name: 'Vegetarian', count: '9 places', imageUrl: unsplash('1540189549336-e6e99c3679fe') },
  { name: 'Bakery', count: '12 places', imageUrl: unsplash('1565958011703-44f9829ba187') },
  { name: 'Bowls', count: '6 places', imageUrl: unsplash('1546069901-ba9599a7e63c') },
];

/**
 * Motion for a hero slot, keyed by promotion id.
 *
 * The web storefront runs a five-second loop behind its hero. Bundled rather
 * than streamed — it starts the moment the feed does, and a banner that only
 * begins moving once the network catches up is worse than a still. Its source
 * is 1920×1080 and 10 MB; what ships here is 960×540, silent, 440 KB.
 *
 * A slot with no entry simply keeps its photograph.
 */
export const HERO_VIDEO: Record<string, ReactVideoSource> = {
  // React Native types a bundled require() as a number, while the player
  // types the same value as NodeRequire. One cast at the declaration keeps
  // every call site clean.
  hero_first_order: {
    uri: require('../../assets/video/hero.mp4') as unknown as NodeRequire,
  },
};

/** The video's first frame, held until playback has something to show. */
export const HERO_POSTER: Record<string, number> = {
  hero_first_order: require('../../assets/images/categories/hero-poster.jpg'),
};

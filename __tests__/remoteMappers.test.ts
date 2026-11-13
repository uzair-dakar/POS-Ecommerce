import {
  decodeMerchantId,
  decodeProductId,
  encodeMerchantId,
  encodeProductId,
  toMoney,
} from '../src/services/remote/mappers/common';
import { buildHomeFeed, mapStoresToMerchants } from '../src/services/remote/mappers/stores';
import { mapStoreToMerchantDetail } from '../src/services/remote/mappers/catalogue';
import { mapLoginToSession } from '../src/services/remote/mappers/auth';
import { mapAvailability } from '../src/services/remote/mappers/reservations';
import type { MerchantId } from '../src/types';

const STORE = {
  storeRequestID: 42,
  storeName: 'Burger O Clock',
  siteHash: 'hash-42',
  // 20 is Restaurant on the tenant; 1 is Adult.
  businessTypeID: 20,
  outlets: [
    { storeOutletID: 7, outletName: 'Valletta', storeAddress: '12 Triq Hal Taxien', storeCityName: 'Valletta', isActive: true },
    { storeOutletID: 8, outletName: 'Sliema', storeCityName: 'Sliema', isActive: true },
  ],
};

const MARKET_STORE = {
  storeRequestID: 90,
  storeName: 'Buzztill Market',
  businessTypeID: 13,
  outlets: [{ storeOutletID: 1, outletName: 'Main Outlet', storeCityName: 'Qormi', isActive: true }],
};

import { CATEGORY_TILES } from '../src/services/remote/staticContent';

describe('money', () => {
  it('converts euros to integer minor units', () => {
    expect(toMoney('10.50')).toBe(1050);
    expect(toMoney(undefined)).toBe(0);
  });
});

describe('ids', () => {
  it('round-trips a merchant reference', () => {
    const id = encodeMerchantId({ businessTypeID: 1, storeRequestID: 42, outletID: 7 });
    expect(decodeMerchantId(id)).toEqual({ businessTypeID: 1, storeRequestID: 42, outletID: 7 });
  });

  it('keeps the owning merchant inside a product id', () => {
    const merchantId = '1.42.7';
    const productId = encodeProductId(merchantId, 'p-9');
    expect(decodeProductId(productId)).toEqual({ merchantId, productID: 'p-9' });
  });
});

describe('stores', () => {
  it('maps every open outlet to its own merchant', () => {
    const merchants = mapStoresToMerchants([STORE, MARKET_STORE]);
    expect(merchants).toHaveLength(3);
    expect(merchants[0].id).toBe('20.42.7');
    expect(merchants[0].kind).toBe('restaurant');
    expect(merchants[2].kind).toBe('market');
  });

  it('drops outlets the backend marks inactive', () => {
    const closed = { ...STORE, outlets: [{ storeOutletID: 7, isActive: false }] };
    expect(mapStoresToMerchants([closed])).toHaveLength(0);
  });

  it('splits the home feed by merchant kind and lists multi-outlet brands', () => {
    const feed = buildHomeFeed([STORE, MARKET_STORE], 'Valletta');
    expect(feed.popularRestaurants).toHaveLength(2);
    expect(feed.markets).toHaveLength(1);
    expect(feed.brands.map(brand => brand.name)).toEqual(['Burger O Clock']);
    expect(feed.categories.length).toBeGreaterThan(0);
  });

  it('shows the storefront rail whatever came back, with unique tile keys', () => {
    // One store, of one business type: the rail must still be the full set, so
    // the row does not change shape with the day's catalogue.
    const feed = buildHomeFeed([MARKET_STORE], 'Valletta');
    const slugs = feed.categories.map(category => category.slug);

    expect(slugs).toEqual(CATEGORY_TILES.map(tile => tile.slug));
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(feed.categories[0]).toMatchObject({ slug: 'restaurants', kind: 'restaurant' });
    expect(feed.categories.find(category => category.slug === 'groceries')).toMatchObject({
      id: '13',
      kind: 'market',
    });
  });

  it('fills the dinner and offers rows from restaurants, ordered differently', () => {
    const feed = buildHomeFeed([STORE, MARKET_STORE], 'Valletta');

    expect(feed.dinner.every(merchant => merchant.kind === 'restaurant')).toBe(true);
    expect(feed.offers.every(merchant => merchant.kind === 'restaurant')).toBe(true);
    expect(feed.offers.map(merchant => merchant.name)).toEqual(
      [...feed.dinner.map(merchant => merchant.name)].reverse(),
    );
  });
});

describe('catalogue', () => {
  const detail = mapStoreToMerchantDetail(
    {
      ...STORE,
      productsByCategory: [
        {
          categoryID: 5,
          categoryName: 'Burgers',
          products: [
            { productID: 11, productName: 'Signature Burger', retailPrice: '10.50', totalInventoryCount: 4, isActiveOnSale: true },
            { productID: 12, productName: 'Sold out', totalInventoryCount: 0, isActiveOnSale: true },
          ],
        },
        { categoryID: 6, categoryName: 'Empty', products: [] },
      ],
    },
    '1.42.7' as MerchantId,
    7,
  );

  it('keeps only sellable products and drops empty sections', () => {
    expect(detail.sections).toHaveLength(1);
    expect(detail.sections[0].products.map(p => p.name)).toEqual(['Signature Burger']);
    expect(detail.sections[0].products[0].price).toBe(1050);
  });

  it('offers reservations for restaurants only', () => {
    expect(detail.acceptsReservations).toBe(true);
  });
});

describe('auth', () => {
  it('splits the display name and keeps the token', () => {
    const session = mapLoginToSession(
      { token: 't', userID: 3, userName: 'Sara Borg', userEmail: 'sara@buzztill.com' },
      'fallback@buzztill.com',
    );
    expect(session).toEqual({
      accessToken: 't',
      user: { id: '3', firstName: 'Sara', lastName: 'Borg', email: 'sara@buzztill.com' },
    });
  });
});

describe('reservations', () => {
  it('maps slots and known seating names', () => {
    const availability = mapAvailability(
      {
        availableTimes: ['19:00', '19:30'],
        seatingOptions: [{ seatingOption: 'Outdoor' }, { seatingOption: 'Nonsense' }],
        maxGuests: 8,
      },
      '1.42.7' as MerchantId,
      'Burger O Clock',
    );

    expect(availability.slots).toEqual([
      { time: '19:00', isAvailable: true },
      { time: '19:30', isAvailable: true },
    ]);
    expect(availability.seating.map(option => option.kind)).toEqual(['outdoor']);
    expect(availability.maxGuests).toBe(8);
  });
});

import type { Money } from '../../../utils/format';

/** The backend prices in euros; the app stores minor units as integers. */
export const toMoney = (value: number | string | undefined | null): Money =>
  Math.round(Number(value ?? 0) * 100) || 0;

export const text = (value: string | undefined | null, fallback = ''): string =>
  (value ?? '').trim() || fallback;

/**
 * A merchant on the storefront is an OUTLET of a store, so its identity needs
 * all three ids the backend wants back on every follow-up call. Encoding them
 * in the id keeps screens and routes carrying one opaque string.
 */
export type MerchantRef = {
  businessTypeID: number;
  storeRequestID: number;
  outletID: number;
};

const MERCHANT_SEPARATOR = '.';

export const encodeMerchantId = (ref: MerchantRef): string =>
  [ref.businessTypeID, ref.storeRequestID, ref.outletID].join(MERCHANT_SEPARATOR);

export const decodeMerchantId = (id: string): MerchantRef => {
  const [businessTypeID, storeRequestID, outletID] = id.split(MERCHANT_SEPARATOR);
  return {
    businessTypeID: Number(businessTypeID) || 0,
    storeRequestID: Number(storeRequestID) || 0,
    outletID: Number(outletID) || 0,
  };
};

/** Products are only ever fetched in the context of the outlet selling them. */
export const encodeProductId = (merchantId: string, productID: string | number): string =>
  `${merchantId}|${productID}`;

export const decodeProductId = (
  id: string,
): { merchantId: string; productID: string } => {
  const separator = id.lastIndexOf('|');
  return separator === -1
    ? { merchantId: '', productID: id }
    : { merchantId: id.slice(0, separator), productID: id.slice(separator + 1) };
};

/** Stable pick from a list, so the same store keeps the same placeholder. */
export const pickStable = <T>(items: readonly T[], seed: string): T => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 100000;
  }
  return items[hash % items.length];
};

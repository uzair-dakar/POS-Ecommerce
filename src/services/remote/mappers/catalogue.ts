import type {
  MenuSection,
  Merchant,
  MerchantDetail,
  MerchantId,
  Product,
  ProductId,
  SectionId,
} from '../../../types';
import type { ProductCategoryDto, ProductDto, StoreWithProductsDto } from '../dto';
import { PRODUCT_PLACEHOLDER_IMAGE } from '../staticContent';
import { encodeProductId, text, toMoney } from './common';
import { kindForBusinessType, mapOutletToMerchant } from './stores';

/**
 * Maps a store's catalogue into the menu the merchant screen renders.
 *
 * The backend groups products by category and pages them; the app models the
 * same thing as menu sections, so the mapping is one-to-one and the screen's
 * tabs keep working unchanged.
 */

const isSellable = (product: ProductDto) =>
  product.isActiveOnSale !== false && Number(product.totalInventoryCount ?? 0) > 0;

export function mapProduct(
  product: ProductDto,
  merchantId: MerchantId,
  isPopular = false,
): Product {
  return {
    id: encodeProductId(merchantId, product.productID ?? '') as ProductId,
    merchantId,
    name: text(product.productName, 'Item'),
    description: product.brandName ? `By ${text(product.brandName)}` : '',
    imageUrl: text(product.thumbnailURL, text(product.imageURL, PRODUCT_PLACEHOLDER_IMAGE)),
    price: toMoney(product.retailPrice),
    isPopular,
  };
}

const sectionFrom = (
  category: ProductCategoryDto,
  merchantId: MerchantId,
  index: number,
): MenuSection => ({
  id: String(category.categoryID ?? `section-${index}`) as SectionId,
  name: text(category.categoryName, 'Menu'),
  products: (category.products ?? []).filter(isSellable).map(product => mapProduct(product, merchantId)),
});

export function mapStoreToMerchantDetail(
  store: StoreWithProductsDto,
  merchantId: MerchantId,
  outletID: number,
): MerchantDetail {
  const outlet =
    (store.outlets ?? []).find(item => Number(item.storeOutletID) === outletID) ??
    (store.outlets ?? [])[0] ??
    {};

  const merchant: Merchant = mapOutletToMerchant(store, outlet);
  const sections = (store.productsByCategory ?? [])
    .map((category, index) => sectionFrom(category, merchantId, index))
    .filter(section => section.products.length > 0);

  // "Most ordered" is not ranked by the API yet, so the first section's
  // opening items stand in for it rather than inventing an order.
  const popular = sections[0]?.products.slice(0, 6) ?? [];

  return {
    merchant: { ...merchant, id: merchantId },
    offers: [],
    popular,
    sections,
    acceptsReservations: kindForBusinessType(store.businessTypeID) === 'restaurant',
    supportsPickup: true,
    pickupMinMinutes: 10,
    pickupMaxMinutes: 25,
    address: text(outlet.storeAddress, text(outlet.storeCityName)),
  };
}

/** True while more catalogue pages remain for this outlet. */
export const hasMoreProducts = (store: StoreWithProductsDto | undefined): boolean =>
  Boolean(store?.hasMoreProducts);

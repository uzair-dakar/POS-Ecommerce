/**
 * The backend's own shapes, as received.
 *
 * Fields are optional because the storefront endpoints omit rather than null
 * what a store has not filled in. Nothing outside `mappers/` may import these
 * — screens only ever see the domain types in `src/types`.
 */

export type OutletDto = {
  storeOutletID?: number | string;
  outletName?: string;
  storeAddress?: string;
  storeCityName?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
  isDelete?: boolean;
};

export type StoreDto = {
  storeRequestID?: number | string;
  storeID?: number | string;
  storeName?: string;
  storeURL?: string;
  siteHash?: string;
  businessTypeID?: number;
  totalOutlets?: number;
  outlets?: OutletDto[];
};

export type ProductTagDto = {
  tagName?: string;
};

export type ProductDto = {
  productID?: number | string;
  productName?: string;
  brandName?: string;
  retailPrice?: number | string;
  thumbnailURL?: string;
  imageURL?: string;
  storeOutletID?: number | string;
  totalInventoryCount?: number | string;
  isActiveOnSale?: boolean;
  tags?: ProductTagDto[];
};

export type ProductCategoryDto = {
  categoryID?: number | string;
  categoryName?: string;
  products?: ProductDto[];
};

export type StoreWithProductsDto = StoreDto & {
  productsByCategory?: ProductCategoryDto[];
  hasMoreProducts?: boolean;
};

export type StoresWithProductsDto = {
  stores?: StoreWithProductsDto[];
};

export type LoginDto = {
  token?: string;
  userID?: number | string;
  userName?: string;
  userEmail?: string;
  roleName?: string;
  businessTypeID?: number;
};

export type ReservationSlotDto = {
  time?: string;
  isAvailable?: boolean;
};

export type ReservationAvailabilityDto = {
  slots?: ReservationSlotDto[];
  availableTimes?: string[];
  seatingOptions?: { seatingOption?: string; name?: string; isAvailable?: boolean }[];
  maxGuests?: number;
};

export type HoldReservationDto = {
  reservationCode?: string;
};

export type ConfirmReservationDto = {
  reservationCode?: string;
  reservationNumber?: string;
};

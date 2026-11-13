/**
 * Every remote endpoint the app may call, named once.
 *
 * The backend renamed its `HomePage` controller to `Storefront` (verified
 * against the deployed web storefront's own bundle, which already calls the
 * new paths). This file is why that was a six-line change.
 *
 * Feature code never writes a backend path: it asks the gateway for an
 * app-level resource ("home/feed") and the gateway picks the endpoint here.
 * When the backend renames a route, this file is the only edit.
 */
export const REMOTE = {
  stores: {
    withOutlets: { path: '/Storefront/GetAllStoresWithOutlets', version: 'v1' },
    withProducts: { path: '/Storefront/GetAllStoresWithProducts', version: 'v1' },
    /** The tenant's business types — the source of truth for category ids. */
    businessTypes: { path: '/Storefront/GetBusinessTypes', version: 'v1' },
  },
  catalogue: {
    productDetails: { path: '/Product/GetProductCommonDetailsByProductID', version: 'base' },
    ecommerceProducts: { path: '/EcommerceProduct/GetEcommerceProductsList', version: 'v1' },
  },
  auth: {
    login: { path: '/Login/CustomerLogin', version: 'v1' },
    register: { path: '/v1/Login/CustomerRegistration', version: 'base' },
  },
  /**
   * Reservations are mid-move on the backend: only Confirm answers today.
   * Availability and Hold 404 under every controller they have lived under,
   * and the web storefront no longer calls them at all — so the feature is
   * blocked on the backend, not on this registry.
   */
  reservations: {
    availability: { path: '/Reservation/GetReservationAvailability', version: 'v1' },
    hold: { path: '/Reservation/HoldReservation', version: 'v1' },
    confirm: { path: '/Reservation/ConfirmReservation', version: 'v1' },
  },
  promotions: {
    /** Also 404 today; validate is the half that survived the rename. */
    forOutlet: { path: '/Storefront/GetEcommerceSalePromotionDetails', version: 'v1' },
    validate: { path: '/Storefront/ValidateEcommercePromotions', version: 'v1' },
  },
  sales: {
    create: { path: '/Sell/PostMainSale', version: 'v1' },
    confirm: { path: '/Sell/PostMainSaleHelper', version: 'v1' },
    pay: { path: '/Sell/AddSalesOrderPayments', version: 'v1' },
    setStatus: { path: '/Sell/PostMainSaleStatus', version: 'v1' },
  },
} as const;

export type RemoteEndpoint = { path: string; version: 'base' | 'v1' };

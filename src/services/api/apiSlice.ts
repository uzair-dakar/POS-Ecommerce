import { createApi } from '@reduxjs/toolkit/query/react';
import { appBaseQuery } from './baseQuery';

/**
 * Root API slice. Features inject their own endpoints via
 * `apiSlice.injectEndpoints`, so adding a feature never edits this file and
 * unused endpoints stay out of the bundle for screens that don't import them.
 */
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: appBaseQuery,
  tagTypes: ['HomeFeed', 'Merchant', 'Basket', 'Order'],
  /** Feed data goes stale after a minute; keeps the home screen fresh. */
  keepUnusedDataFor: 60,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});

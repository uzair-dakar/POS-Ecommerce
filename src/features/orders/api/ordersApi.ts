import { apiSlice } from '../../../services/api';
import type { MerchantId, Order, OrderId } from '../../../types';
import type { BasketLine } from '../../basket/basketSlice';

export type PlaceOrderRequest = {
  merchantId: MerchantId;
  merchantName: string;
  merchantImageUrl: string;
  lines: readonly BasketLine[];
};

export const ordersApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getOrders: builder.query<readonly Order[], void>({
      query: () => ({ url: 'orders' }),
      providesTags: ['Order'],
    }),

    getOrder: builder.query<Order, OrderId>({
      query: id => ({ url: `orders/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),

    placeOrder: builder.mutation<Order, PlaceOrderRequest>({
      query: body => ({ url: 'orders/place', method: 'POST', body }),
      // A new order makes the history list stale.
      invalidatesTags: ['Order'],
    }),
  }),
});

export const { useGetOrdersQuery, useGetOrderQuery, usePlaceOrderMutation } = ordersApi;

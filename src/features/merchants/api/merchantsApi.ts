import { apiSlice } from '../../../services/api';
import type {
  Chain,
  ChainDetail,
  ChainId,
  Merchant,
  MerchantDetail,
  MerchantId,
  MerchantKind,
  Product,
  ProductId,
  ProductOptionGroup,
} from '../../../types';

export type ProductDetail = {
  product: Product;
  optionGroups: readonly ProductOptionGroup[];
};

export type SearchResults = {
  merchants: readonly Merchant[];
  products: readonly Product[];
};

export const merchantsApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getMerchants: builder.query<readonly Merchant[], { kind?: MerchantKind }>({
      query: params => ({ url: 'merchants', params }),
      providesTags: ['Merchant'],
    }),

    getMerchant: builder.query<MerchantDetail, MerchantId>({
      query: id => ({ url: `merchants/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'Merchant', id }],
    }),

    getChains: builder.query<readonly Chain[], void>({
      query: () => ({ url: 'chains' }),
    }),

    getChain: builder.query<ChainDetail, ChainId>({
      query: id => ({ url: `chains/${id}` }),
    }),

    search: builder.query<SearchResults, string>({
      query: q => ({ url: 'search', params: { q } }),
    }),

    getProduct: builder.query<ProductDetail, ProductId>({
      query: id => ({ url: `products/${id}` }),
    }),
  }),
});

export const {
  useGetMerchantsQuery,
  useGetMerchantQuery,
  useGetChainsQuery,
  useGetChainQuery,
  useGetProductQuery,
  useSearchQuery,
} = merchantsApi;

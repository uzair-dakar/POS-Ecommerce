import { apiSlice } from '../../../services/api';
import type { HomeFeed } from '../../../types';

/**
 * Home endpoints, injected into the root api slice. RTK Query generates the
 * hook, the cache entry, loading/error flags and de-duplication for us.
 */
export const homeApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getHomeFeed: builder.query<HomeFeed, void>({
      query: () => ({ url: 'home/feed' }),
      providesTags: ['HomeFeed'],
    }),
  }),
});

export const { useGetHomeFeedQuery } = homeApi;

import type { HomeFeed, Merchant, MerchantKind } from '../../types';
import { MOCK_HOME_FEED, MOCK_MERCHANTS } from './data';

/** Mirrors the future REST surface: one entry per endpoint path. */
export const mockHandlers: Record<string, (params?: unknown) => unknown> = {
  'home/feed': () => MOCK_HOME_FEED satisfies HomeFeed,

  'merchants': (params) => {
    const kind = (params as { kind?: MerchantKind } | undefined)?.kind;
    return (kind ? MOCK_MERCHANTS.filter(m => m.kind === kind) : MOCK_MERCHANTS) satisfies readonly Merchant[];
  },
};

import React from 'react';
import { MerchantListScreen } from './MerchantListScreen';

/**
 * The Markets tab is the market list with its kind fixed.
 *
 * The tab has no params of its own, while the stack route takes a `kind`, so
 * this thin wrapper supplies it rather than making the list screen guess
 * where it was mounted from.
 */
export function MarketsTabScreen() {
  return <MerchantListScreen kind="market" />;
}

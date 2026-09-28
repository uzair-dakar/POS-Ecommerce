import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { MerchantId, ProductId } from '../../types';
import type { Money } from '../../utils/format';

export type BasketLine = {
  productId: ProductId;
  name: string;
  imageUrl: string;
  /** Unit price *including* selected options, so totals are a simple sum. */
  unitPrice: Money;
  quantity: number;
  optionsSummary?: string;
};

export type BasketState = {
  /** A basket belongs to exactly one merchant; switching clears it. */
  merchantId: MerchantId | null;
  merchantName: string | null;
  lines: BasketLine[];
  deliveryFee: Money;
};

const initialState: BasketState = {
  merchantId: null,
  merchantName: null,
  lines: [],
  deliveryFee: 0,
};

const basketSlice = createSlice({
  name: 'basket',
  initialState,
  reducers: {
    lineAdded: (
      state,
      action: PayloadAction<{ merchantId: MerchantId; merchantName: string; line: BasketLine }>,
    ) => {
      const { merchantId, merchantName, line } = action.payload;

      // Ordering from a different merchant starts a fresh basket.
      if (state.merchantId && state.merchantId !== merchantId) {
        state.lines = [];
      }
      state.merchantId = merchantId;
      state.merchantName = merchantName;

      const existing = state.lines.find(
        l => l.productId === line.productId && l.optionsSummary === line.optionsSummary,
      );
      if (existing) {
        existing.quantity += line.quantity;
      } else {
        state.lines.push(line);
      }
    },

    lineQuantityChanged: (
      state,
      action: PayloadAction<{ productId: ProductId; quantity: number }>,
    ) => {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        state.lines = state.lines.filter(l => l.productId !== productId);
      } else {
        const line = state.lines.find(l => l.productId === productId);
        if (line) {
          line.quantity = quantity;
        }
      }
      if (state.lines.length === 0) {
        state.merchantId = null;
        state.merchantName = null;
      }
    },

    basketCleared: () => initialState,
  },
});

export const { lineAdded, lineQuantityChanged, basketCleared } = basketSlice.actions;
export const basketReducer = basketSlice.reducer;

/* ------------------------------ selectors ------------------------------ */

type RootSlice = { basket: BasketState };

export const selectBasket = (state: RootSlice) => state.basket;
export const selectBasketLines = (state: RootSlice) => state.basket.lines;

/**
 * Memoised so the floating basket bar only re-renders when the numbers it
 * shows actually change, not on every unrelated store update.
 */
export const selectBasketSummary = createSelector([selectBasket], basket => {
  const itemCount = basket.lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = basket.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  return {
    itemCount,
    subtotal,
    total: subtotal + (itemCount > 0 ? basket.deliveryFee : 0),
    isEmpty: itemCount === 0,
    merchantName: basket.merchantName,
  };
});

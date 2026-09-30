import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  OptionId,
  Product,
  ProductOption,
  ProductOptionGroup,
} from '../../../types';
import type { Money } from '../../../utils/format';

export type Selections = Record<string, readonly OptionId[]>;

/**
 * Owns the choices made on a product page: which options are picked, what the
 * line costs, and whether every required group is satisfied.
 *
 * Kept out of the screen so the pricing and validity rules can be reasoned
 * about — and tested — without a render.
 */
export function useProductSelection(
  product: Product | undefined,
  groups: readonly ProductOptionGroup[],
) {
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Selections>({});
  const hasSeededDefaults = useRef(false);

  /**
   * Single-choice required groups start on their first available option, the
   * way the design shows them pre-filled.
   *
   * This runs in an effect rather than in the initial state because the groups
   * arrive with the query, one render after this hook first runs — seeding at
   * mount would always see an empty list and leave the item unaddable.
   */
  useEffect(() => {
    if (hasSeededDefaults.current || groups.length === 0) {
      return;
    }
    hasSeededDefaults.current = true;

    setSelections(
      groups.reduce<Selections>((acc, group) => {
        if (group.minSelections > 0 && group.maxSelections === 1) {
          const first = group.options.find(option => option.isAvailable);
          if (first) {
            acc[group.id] = [first.id];
          }
        }
        return acc;
      }, {}),
    );
  }, [groups]);

  const toggleOption = useCallback((group: ProductOptionGroup, option: ProductOption) => {
    setSelections(current => {
      const picked = current[group.id] ?? [];

      if (group.maxSelections === 1) {
        // Required single-choice groups cannot be emptied by re-tapping.
        if (picked.includes(option.id)) {
          return group.minSelections > 0 ? current : { ...current, [group.id]: [] };
        }
        return { ...current, [group.id]: [option.id] };
      }

      if (picked.includes(option.id)) {
        return { ...current, [group.id]: picked.filter(id => id !== option.id) };
      }
      if (picked.length >= group.maxSelections) {
        return current;
      }
      return { ...current, [group.id]: [...picked, option.id] };
    });
  }, []);

  const optionsTotal = useMemo<Money>(
    () =>
      groups.reduce((sum, group) => {
        const picked = selections[group.id] ?? [];
        return (
          sum +
          group.options
            .filter(option => picked.includes(option.id))
            .reduce((groupSum, option) => groupSum + option.priceDelta, 0)
        );
      }, 0),
    [groups, selections],
  );

  const unitPrice = (product?.price ?? 0) + optionsTotal;

  const isValid = useMemo(
    () =>
      groups.every(group => (selections[group.id] ?? []).length >= group.minSelections),
    [groups, selections],
  );

  /** "American cheese, crispy onions" — shown under the line in the basket. */
  const optionsSummary = useMemo(() => {
    const names = groups.flatMap(group => {
      const picked = selections[group.id] ?? [];
      return group.options.filter(option => picked.includes(option.id)).map(o => o.name);
    });
    return names.length > 0 ? names.join(', ') : undefined;
  }, [groups, selections]);

  return {
    quantity,
    increment: useCallback(() => setQuantity(q => Math.min(q + 1, 99)), []),
    decrement: useCallback(() => setQuantity(q => Math.max(q - 1, 1)), []),
    selections,
    toggleOption,
    unitPrice,
    lineTotal: unitPrice * quantity,
    optionsSummary,
    isValid,
  };
}

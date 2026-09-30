import { useEffect, useState } from 'react';

/**
 * Returns `value` only once it has stopped changing for `delayMs`.
 *
 * Used to keep a search request per keystroke from being fired — the input
 * stays fully responsive because it still renders every character; only the
 * value the query reads lags behind.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return settled;
}

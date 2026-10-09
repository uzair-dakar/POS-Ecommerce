import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../theme';

/**
 * Bottom padding for a docked footer.
 *
 * Where the device reserves space — a gesture bar, a notch — the footer clears
 * it. Where it reserves none, a button still needs room to breathe rather than
 * sitting on the screen edge, so there is a floor. One place to change it, so
 * every footer in the app keeps the same footing.
 */
export function useFooterInset(): number {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, spacing.xxxl);
}

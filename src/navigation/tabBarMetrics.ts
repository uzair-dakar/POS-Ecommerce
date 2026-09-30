import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../theme';

export const TAB_BAR_HEIGHT = 66;

/** Side inset — wider than the page gutter so the bar reads as floating. */
export const TAB_BAR_SIDE_INSET = spacing.xxl;

/**
 * Metrics for the floating tab bar, shared by the bar itself and by every
 * screen that has to scroll clear of it. Keeping them here means the feed's
 * bottom padding can never drift out of sync with the bar's real position.
 */
export function useTabBarMetrics() {
  const insets = useSafeAreaInsets();

  // Sit a clear gap above the gesture bar / navigation buttons rather than
  // flush against them.
  const bottom = Math.max(insets.bottom, spacing.sm) + spacing.md;

  return {
    bottom,
    height: TAB_BAR_HEIGHT,
    /** Distance from the screen bottom to the top edge of the bar. */
    clearance: bottom + TAB_BAR_HEIGHT,
  };
}

import { StyleSheet, type ViewStyle } from 'react-native';
import { colors } from './colors';
import { radii } from './spacing';
import { shadows } from './shadows';

/**
 * Composite surface recipes.
 *
 * A card is a shadow plus a hairline, not one or the other: the shadow gives
 * it depth on the off-white page, and the hairline keeps its edge crisp where
 * the shadow is too soft to read (and on Android, where elevation alone can
 * wash out). Screens compose these instead of restating the same four
 * properties each time.
 */
export const surfaces = {
  /** Default content card. */
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadows.card,
  } as ViewStyle,

  /** Larger panels and sheets — hero cards, confirmation panels. */
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadows.raised,
  } as ViewStyle,

  /** Quiet rows inside an already-raised container: outline only. */
  outlined: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
  } as ViewStyle,
} as const;

export type SurfaceToken = keyof typeof surfaces;

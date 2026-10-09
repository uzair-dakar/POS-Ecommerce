import { Platform, ViewStyle } from 'react-native';

/**
 * A shadow tinted with the brand navy rather than black — on a warm off-white
 * ground a black shadow reads as grey dirt, a navy one reads as depth.
 */
const SHADOW_COLOR = '#0A2E4A';

const make = (
  offsetY: number,
  radius: number,
  opacity: number,
  elevation: number,
): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: offsetY },
      shadowRadius: radius,
      shadowOpacity: opacity,
    },
    // Android's elevation also paints its own ambient shadow, so the tint is
    // applied here too where the platform supports it.
    android: { elevation, shadowColor: SHADOW_COLOR },
    default: {},
  })!;

/**
 * The scale is deliberately strong. On a near-white page a white card has no
 * colour difference to fall back on, so the shadow is the only thing saying it
 * is a separate object — a shadow you have to look for is doing no work.
 */
export const shadows = {
  none: {} as ViewStyle,
  /** Barely-there lift for list rows that still need to read as separate. */
  subtle: make(2, 6, 0.08, 2),
  /** The default for content cards. */
  card: make(6, 16, 0.15, 6),
  /** Hero cards, sheets and anything overlapping imagery. */
  raised: make(12, 28, 0.19, 12),
  /** The floating tab bar and basket bar. */
  floating: make(16, 36, 0.24, 18),
} as const;

export type ShadowToken = keyof typeof shadows;

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

export const shadows = {
  none: {} as ViewStyle,
  /** Barely-there lift for list rows that still need to read as separate. */
  subtle: make(1, 3, 0.05, 1),
  /** The default for content cards. */
  card: make(4, 12, 0.1, 4),
  /** Hero cards, sheets and anything overlapping imagery. */
  raised: make(8, 20, 0.14, 8),
  /** The floating tab bar and basket bar. */
  floating: make(12, 28, 0.18, 14),
} as const;

export type ShadowToken = keyof typeof shadows;

import { Platform, ViewStyle } from 'react-native';

const make = (
  offsetY: number,
  radius: number,
  opacity: number,
  elevation: number,
): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#06283F',
      shadowOffset: { width: 0, height: offsetY },
      shadowRadius: radius,
      shadowOpacity: opacity,
    },
    android: { elevation },
    default: {},
  })!;

export const shadows = {
  none: {} as ViewStyle,
  card: make(2, 8, 0.06, 2),
  raised: make(6, 16, 0.1, 6),
  floating: make(10, 24, 0.14, 12),
} as const;

export type ShadowToken = keyof typeof shadows;

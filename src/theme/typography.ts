import { Platform, TextStyle } from 'react-native';

/**
 * Swap these two constants when the brand font files are added to the
 * project — every text style picks them up automatically.
 */
const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

const fontFamilyMono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

type Variant = TextStyle & { fontFamily?: string };

export const textVariants = {
  /** Screen titles — "Your favourites, delivered fresh." */
  display: { fontFamily, fontSize: 30, lineHeight: 36, fontWeight: '800' },
  h1: { fontFamily, fontSize: 24, lineHeight: 30, fontWeight: '800' },
  h2: { fontFamily, fontSize: 20, lineHeight: 26, fontWeight: '700' },
  h3: { fontFamily, fontSize: 17, lineHeight: 22, fontWeight: '700' },
  /** Section eyebrows — "CURATED FOR YOU" */
  eyebrow: {
    fontFamily,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  body: { fontFamily, fontSize: 15, lineHeight: 21, fontWeight: '400' },
  bodyStrong: { fontFamily, fontSize: 15, lineHeight: 21, fontWeight: '600' },
  caption: { fontFamily, fontSize: 13, lineHeight: 18, fontWeight: '400' },
  captionStrong: { fontFamily, fontSize: 13, lineHeight: 18, fontWeight: '600' },
  label: { fontFamily, fontSize: 11, lineHeight: 14, fontWeight: '600' },
  button: { fontFamily, fontSize: 16, lineHeight: 20, fontWeight: '700' },
  /** Prices use tabular figures so columns line up while quantities change. */
  price: { fontFamily: fontFamilyMono, fontSize: 15, lineHeight: 20, fontWeight: '700' },
  priceLarge: { fontFamily: fontFamilyMono, fontSize: 22, lineHeight: 28, fontWeight: '700' },
  priceSmall: { fontFamily: fontFamilyMono, fontSize: 12, lineHeight: 16, fontWeight: '600' },
} satisfies Record<string, Variant>;

export type TextVariant = keyof typeof textVariants;

import { Platform, TextStyle } from 'react-native';

/**
 * Nunito, linked from src/assets/fonts.
 *
 * Picked to match the reference app's rounded geometric type (its own face,
 * Omnes, is commercial). Nunito's rounded terminals and wide, friendly
 * counters give the same warmth, and it ships an open licence.
 *
 * On Android a weight is a separate font file — `fontWeight` alone picks the
 * wrong face — so every style names the exact family.
 */
const FAMILY = {
  regular: 'Nunito-Regular',
  medium: 'Nunito-Medium',
  semibold: 'Nunito-SemiBold',
  bold: 'Nunito-Bold',
  extrabold: 'Nunito-ExtraBold',
  black: 'Nunito-Black',
} as const;

/**
 * Numerals that don't shift width as they change — so a price ticking from
 * €9.99 to €10.00, or a quantity stepper, never nudges the layout.
 */
const TABULAR: TextStyle = Platform.select({
  ios: { fontVariant: ['tabular-nums'] },
  default: { fontVariant: ['tabular-nums'] },
})!;

type Variant = TextStyle;

/**
 * Headings run heavier and tighter than the body, which is what gives the
 * reference app its punchy, set-by-hand feel; captions get neutral tracking so
 * they stay legible small.
 */
export const textVariants = {
  /** Screen titles — "Your favourites, delivered fresh." */
  display: {
    fontFamily: FAMILY.black,
    fontSize: 31,
    lineHeight: 38,
    letterSpacing: -0.6,
  },
  h1: { fontFamily: FAMILY.black, fontSize: 25, lineHeight: 32, letterSpacing: -0.45 },
  /** Section titles — "Brands you love", "Fastest delivery". */
  h2: { fontFamily: FAMILY.extrabold, fontSize: 21, lineHeight: 27, letterSpacing: -0.3 },
  h3: { fontFamily: FAMILY.bold, fontSize: 16.5, lineHeight: 22, letterSpacing: -0.15 },

  /** Section eyebrows — "CURATED FOR YOU" */
  eyebrow: {
    fontFamily: FAMILY.extrabold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  body: { fontFamily: FAMILY.regular, fontSize: 15, lineHeight: 21, letterSpacing: 0 },
  bodyStrong: { fontFamily: FAMILY.bold, fontSize: 15, lineHeight: 21, letterSpacing: -0.1 },
  caption: { fontFamily: FAMILY.regular, fontSize: 13.5, lineHeight: 19, letterSpacing: 0 },
  captionStrong: { fontFamily: FAMILY.bold, fontSize: 13.5, lineHeight: 19, letterSpacing: 0 },
  label: { fontFamily: FAMILY.bold, fontSize: 11.5, lineHeight: 15, letterSpacing: 0.1 },
  button: { fontFamily: FAMILY.extrabold, fontSize: 15.5, lineHeight: 21, letterSpacing: -0.1 },

  /** Money and counts, in the brand face with tabular figures. */
  price: { fontFamily: FAMILY.bold, fontSize: 14.5, lineHeight: 20, letterSpacing: -0.1, ...TABULAR },
  priceLarge: {
    fontFamily: FAMILY.black,
    fontSize: 24,
    lineHeight: 31,
    letterSpacing: -0.4,
    ...TABULAR,
  },
  priceSmall: {
    fontFamily: FAMILY.semibold,
    fontSize: 12.5,
    lineHeight: 17,
    letterSpacing: 0,
    ...TABULAR,
  },
} satisfies Record<string, Variant>;

export type TextVariant = keyof typeof textVariants;
export { FAMILY as fontFamilies };

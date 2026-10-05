/**
 * Raw brand palette. Never reference these directly in screens —
 * use the semantic `colors` map below so a re-skin touches one file.
 */
const palette = {
  navy900: '#06283F',
  navy800: '#0A2E4A',
  navy700: '#123C5C',
  navy600: '#1D4F72',

  orange600: '#C87316',
  orange500: '#DE8A22',
  orange400: '#F5921F',
  orange100: '#FBE6CC',
  orange50: '#FDF3E6',

  green600: '#2E9E44',
  green100: '#DDF3E1',

  red600: '#D8402F',
  red100: '#FBE3E0',

  slate700: '#33495B',
  slate500: '#5A7184',
  slate400: '#8296A6',
  slate300: '#C3CED7',
  slate200: '#E2E8ED',
  slate100: '#F0F3F5',
  slate50: '#F5F7F9',
  canvas: '#F7F5F2',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(6, 40, 63, 0.55)',
  transparent: 'transparent',
} as const;

export const colors = {
  // Brand
  primary: palette.navy800,
  primaryDark: palette.navy900,
  primaryMuted: palette.navy600,
  accent: palette.orange500,
  accentPressed: palette.orange600,
  accentBright: palette.orange400,
  accentSoft: palette.orange100,
  accentSurface: palette.orange50,

  // Surfaces
  background: palette.canvas,
  surface: palette.white,
  surfaceMuted: palette.slate100,
  surfaceInverse: palette.navy800,
  overlay: palette.overlay,

  // Text
  text: palette.navy800,
  textInverse: palette.white,
  textMuted: palette.slate500,
  textSubtle: palette.slate400,
  textAccent: palette.orange500,

  // Lines
  border: palette.slate200,
  borderStrong: palette.slate300,
  divider: palette.slate200,

  // Status
  success: palette.green600,
  successSurface: palette.green100,
  danger: palette.red600,
  dangerSurface: palette.red100,

  transparent: palette.transparent,
} as const;

export type ColorToken = keyof typeof colors;

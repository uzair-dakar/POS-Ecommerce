import React, { memo } from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors, textVariants, type ColorToken, type TextVariant } from '../../theme';

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  color?: ColorToken;
  align?: 'left' | 'center' | 'right';
};

/**
 * The only text primitive in the app. Screens pick a variant instead of
 * hand-rolling fontSize/weight, which keeps type consistent everywhere.
 */
function AppTextBase({
  variant = 'body',
  color = 'text',
  align,
  style,
  ...rest
}: TextProps) {
  return (
    <RNText
      {...rest}
      style={StyleSheet.compose(
        [textVariants[variant], { color: colors[color] }, align ? { textAlign: align } : null],
        style,
      )}
    />
  );
}

export const AppText = memo(AppTextBase);

import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, type ColorToken } from '../../theme';
import { AppText } from './Text';

export type WordmarkProps = {
  size?: 'sm' | 'md' | 'lg';
  color?: ColorToken;
};

const SIZES = {
  sm: { fontSize: 13, lineHeight: 14 },
  md: { fontSize: 22, lineHeight: 23 },
  lg: { fontSize: 34, lineHeight: 34 },
} as const;

/**
 * The BUZZ/TILL wordmark — two stacked, right-leaning lines.
 *
 * Drawn from type rather than shipped as an image so it stays crisp at every
 * size and can be recoloured per surface. Swap the inner AppText for an SVG
 * here when the real logo artwork arrives; no caller changes.
 */
function WordmarkBase({ size = 'md', color = 'accentBright' }: WordmarkProps) {
  const metrics = SIZES[size];

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Buzztill"
      style={styles.wrapper}>
      {(['BUZZ', 'TILL'] as const).map(line => (
        <AppText
          key={line}
          color={color}
          style={[styles.line, metrics, { color: colors[color] }]}>
          {line}
        </AppText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'flex-start' },
  line: {
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
});

export const Wordmark = memo(WordmarkBase);

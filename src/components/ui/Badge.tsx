import React, { memo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radii, spacing } from '../../theme';
import { AppText } from './Text';
import type { ColorToken } from '../../theme';

export type BadgeTone = 'accent' | 'success' | 'danger' | 'info' | 'neutral' | 'solid';

const TONES: Record<BadgeTone, { bg: ColorToken; fg: ColorToken }> = {
  accent: { bg: 'accentSoft', fg: 'accentPressed' },
  success: { bg: 'successSurface', fg: 'success' },
  danger: { bg: 'dangerSurface', fg: 'danger' },
  info: { bg: 'surfaceMuted', fg: 'primaryMuted' },
  neutral: { bg: 'surfaceMuted', fg: 'textMuted' },
  solid: { bg: 'accent', fg: 'textInverse' },
};

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  style?: ViewStyle;
};

/** Small status pill — "20% off", "Delivered", "Fastest", "Popular". */
function BadgeBase({ label, tone = 'accent', style }: BadgeProps) {
  const { bg, fg } = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: colors[bg] }, style]}>
      <AppText variant="label" color={fg} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
});

export const Badge = memo(BadgeBase);

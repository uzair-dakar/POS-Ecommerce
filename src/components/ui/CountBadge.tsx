import React, { memo } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

import { colors, radii, spacing } from '../../theme';
import { AppText } from './Text';

export type CountBadgeProps = {
  count: number;
  /** 'accent' reads as "something waiting"; 'danger' as "needs attention". */
  tone?: 'accent' | 'danger';
  /** Draws a ring in the surface colour, for badges that overlap an icon. */
  bordered?: boolean;
  style?: ViewStyle;
};

const MAX = 99;

/**
 * A live count on an icon.
 *
 * Renders nothing at zero and animates in when the number first appears, so a
 * basket filling up or an order going live is something the user notices
 * rather than discovers.
 */
function CountBadgeBase({ count, tone = 'accent', bordered = true, style }: CountBadgeProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <Animated.View
      entering={ZoomIn.springify().damping(14)}
      exiting={FadeOut.duration(120)}
      style={[
        styles.badge,
        tone === 'danger' ? styles.danger : styles.accent,
        bordered && styles.bordered,
        style,
      ]}>
      <Animated.View key={count} entering={FadeIn.duration(140)}>
        <AppText variant="label" color="textInverse" numberOfLines={1}>
          {count > MAX ? `${MAX}+` : count}
        </AppText>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 19,
    height: 19,
    paddingHorizontal: 5,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accent: { backgroundColor: colors.accent },
  danger: { backgroundColor: colors.danger },
  bordered: { borderWidth: 2, borderColor: colors.surface },
});

export const CountBadge = memo(CountBadgeBase);

/** Positions a badge over the top-right of a glyph. */
export const badgeAnchor: ViewStyle = {
  position: 'absolute',
  top: -spacing.sm,
  right: -spacing.md,
};

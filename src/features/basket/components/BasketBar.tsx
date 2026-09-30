import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Icon } from '../../../components/ui';
import { colors, radii, shadows, SCREEN_GUTTER, spacing } from '../../../theme';
import { formatPrice } from '../../../utils';
import { useAppSelector } from '../../../store/hooks';
import { selectBasketSummary } from '../basketSlice';

export type BasketBarProps = {
  onPress: () => void;
  /**
   * Lifts the bar above whatever sits below it — pass the tab bar's clearance
   * on a tab screen. Defaults to clearing the gesture bar / nav buttons, which
   * a stack screen needs on its own.
   */
  bottomOffset?: number;
};

/**
 * Floating "View basket" bar. Reads the basket itself through a memoised
 * selector rather than taking props, so screens can drop it in anywhere and
 * it re-renders only when the totals actually change.
 */
function BasketBarBase({ onPress, bottomOffset }: BasketBarProps) {
  const insets = useSafeAreaInsets();
  const { itemCount, total, isEmpty } = useAppSelector(selectBasketSummary);

  const bottom = bottomOffset ?? Math.max(insets.bottom, spacing.sm) + spacing.md;

  if (isEmpty) {
    return null;
  }

  return (
    <View style={[styles.wrapper, { bottom }]} pointerEvents="box-none">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View basket, ${itemCount} items, ${formatPrice(total)}`}
        onPress={onPress}
        style={({ pressed }) => [styles.bar, pressed && styles.pressed]}>
        <View style={styles.count}>
          <AppText variant="captionStrong" color="text">
            {itemCount}
          </AppText>
        </View>

        <AppText variant="button" color="textInverse" style={styles.label}>
          View basket
        </AppText>

        <AppText variant="price" color="textInverse">
          {formatPrice(total)}
        </AppText>
        <Icon name="chevronRight" size={16} color={colors.textInverse} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', left: SCREEN_GUTTER, right: SCREEN_GUTTER },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 58,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    ...shadows.floating,
  },
  count: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1 },
  pressed: { opacity: 0.92 },
});

export const BasketBar = memo(BasketBarBase);

import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View, type ListRenderItem } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { AppImage, AppText, Icon } from '../../../components/ui';
import { HorizontalList } from '../../../components/layout';
import { colors, radii, spacing } from '../../../theme';
import type { Category, CategoryId } from '../../../types';

export type StickyCategoryHeaderProps = {
  scrollY: SharedValue<number>;
  categories: readonly Category[];
  deliverTo: string;
  selectedId?: CategoryId;
  onSelect: (id: CategoryId) => void;
  onChangeAddress: () => void;
};

/** Scroll distance over which the bar takes over from the feed's own header. */
const FADE_START = 90;
const FADE_END = 170;

/**
 * The bar that takes over once the feed's big category tiles scroll away.
 *
 * It keeps the same categories reachable the whole way down the feed, which is
 * the behaviour the reference app is built around — browsing never requires
 * scrolling back to the top. The tiles become compact tabs rather than
 * disappearing, so the user's place in the hierarchy stays visible.
 *
 * Driven straight from the scroll position on the UI thread, so it tracks the
 * finger even while the feed is mid-render on the JS thread.
 */
function StickyCategoryHeaderBase({
  scrollY,
  categories,
  deliverTo,
  selectedId,
  onSelect,
  onChangeAddress,
}: StickyCategoryHeaderProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.value,
      [FADE_START, FADE_END],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      opacity: progress,
      transform: [{ translateY: interpolate(progress, [0, 1], [-16, 0]) }],
      // Untouchable until it has actually appeared, so it never swallows a tap
      // meant for the feed underneath.
      pointerEvents: progress > 0.5 ? 'auto' : 'none',
    };
  });

  const renderTab = useCallback<ListRenderItem<Category>>(
    ({ item }) => {
      const isSelected = item.id === selectedId;
      return (
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: isSelected }}
          onPress={() => onSelect(item.id)}
          style={({ pressed }) => [
            styles.tab,
            isSelected && styles.tabSelected,
            pressed && styles.pressed,
          ]}>
          <AppImage source={{ uri: item.imageUrl }} style={styles.tabImage} />
          <AppText variant="captionStrong" color={isSelected ? 'textInverse' : 'text'}>
            {item.name}
          </AppText>
        </Pressable>
      );
    },
    [selectedId, onSelect],
  );

  return (
    <Animated.View style={[styles.bar, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Delivering to ${deliverTo}. Change address`}
        onPress={onChangeAddress}
        style={styles.location}>
        <AppText variant="bodyStrong">{deliverTo}</AppText>
        <Icon name="chevronDown" size={15} color={colors.text} />
      </Pressable>

      <View style={styles.tabs}>
        <HorizontalList
          data={categories}
          renderItem={renderTab}
          keyExtractor={item => item.id}
          gap={spacing.sm}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  tabs: { marginBottom: -spacing.xs },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.sm,
    paddingRight: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabImage: { width: 26, height: 26, borderRadius: radii.sm },
  pressed: { opacity: 0.85 },
});

export const StickyCategoryHeader = memo(StickyCategoryHeaderBase);

import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import {
  AppText,
  CountBadge,
  GlassSurface,
  GLASS_NAVY,
  Icon,
  badgeAnchor,
  type IconName,
} from '../components/ui';
import { colors, radii, shadows, spacing } from '../theme';
import { TAB_BAR_SIDE_INSET, useTabBarMetrics } from './tabBarMetrics';

export type TabItem = {
  label: string;
  icon: IconName;
  /** Live number shown on the glyph — basket lines, orders in flight. */
  badgeCount?: number;
};

export type GlassTabBarProps = BottomTabBarProps & {
  /** Keyed by route name, so the bar owns no knowledge of the routes. */
  items: Record<string, TabItem>;
  /** The basket action docked at the trailing edge. */
  basket: {
    count: number;
    onPress: () => void;
  };
};

/** Inactive glyphs on the dark pane. */
const RESTING = 'rgba(255, 255, 255, 0.72)';

/** Padding between the glass edge and the indicator pill. */
const INSET = 5;

/** The raised basket button's diameter. */
const BASKET_SIZE = 50;

/**
 * Settles quickly without overshooting into a wobble — the indicator should
 * read as decisive, not springy.
 */
const SPRING = { damping: 18, stiffness: 190, mass: 0.7 } as const;

/**
 * The floating tab bar.
 *
 * Two things make it a shop's bar rather than a generic one. The basket is
 * always present and always current — raised out of the glass at the trailing
 * edge with a live count — so the thing a customer is actually building is
 * never more than one tap away and never hidden behind a screen. And the tabs
 * carry their own live counts, so an order in flight is visible from anywhere.
 *
 * One indicator slides between tabs rather than each tab lighting up on its
 * own: the movement carries the eye from where it was to where it now is. It
 * also stretches along the direction of travel and settles back, which is what
 * separates something moving from something being redrawn in a new place.
 */
export function GlassTabBar({
  state,
  descriptors,
  navigation,
  items,
  basket,
}: GlassTabBarProps) {
  const { bottom, height } = useTabBarMetrics();
  const [tabsWidth, setTabsWidth] = useState(0);

  const tabWidth = tabsWidth > 0 ? tabsWidth / state.routes.length : 0;

  // Fractional, so every tab can read its own distance from the active one and
  // animate against the same movement.
  const activeIndex = useSharedValue(state.index);
  const previousIndex = useSharedValue(state.index);

  useEffect(() => {
    previousIndex.value = activeIndex.value;
    activeIndex.value = withSpring(state.index, SPRING);
  }, [state.index, activeIndex, previousIndex]);

  const indicatorStyle = useAnimatedStyle(() => {
    // Distance still to travel, as a fraction of one tab. The pill stretches
    // while it is in motion and returns to its resting width as it lands.
    const travel = Math.min(Math.abs(activeIndex.value - previousIndex.value), 1);
    const stretch = interpolate(travel, [0, 0.5, 1], [1, 1.18, 1]);

    return {
      width: tabWidth,
      transform: [
        { translateX: INSET + activeIndex.value * tabWidth },
        { scaleX: stretch },
      ],
    };
  });

  return (
    <View
      style={[
        styles.wrapper,
        { bottom, height, left: TAB_BAR_SIDE_INSET, right: TAB_BAR_SIDE_INSET },
      ]}>
      <View style={styles.bar}>
        <GlassSurface
          style={styles.glass}
          tint={GLASS_NAVY}
          from={0.9}
          to={0.97}
          highlightColor="rgba(255, 255, 255, 0.22)"
        />

        <View
          style={styles.tabs}
          onLayout={event => setTabsWidth(event.nativeEvent.layout.width - INSET * 2)}>
          {tabWidth > 0 ? <Animated.View style={[styles.indicator, indicatorStyle]} /> : null}

          {state.routes.map((route, index) => {
            const item = items[route.name];
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TabButton
                key={route.key}
                index={index}
                activeIndex={activeIndex}
                label={item?.label ?? options.title ?? route.name}
                icon={item?.icon ?? 'home'}
                badgeCount={item?.badgeCount ?? 0}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={() =>
                  navigation.emit({ type: 'tabLongPress', target: route.key })
                }
              />
            );
          })}
        </View>

        <BasketButton count={basket.count} onPress={basket.onPress} />
      </View>
    </View>
  );
}

function BasketButton({ count, onPress }: { count: number; onPress: () => void }) {
  return (
    <View style={styles.basketSlot}>
      {/* Marks the basket as a different kind of control from the four
          navigation tabs beside it. */}
      <View style={styles.basketDivider} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          count > 0 ? `Basket, ${count} items` : 'Basket, empty'
        }
        onPress={onPress}
        style={({ pressed }) => [styles.basket, pressed && styles.basketPressed]}>
        <Icon name="bag" size={22} color={colors.textInverse} />
      </Pressable>

      <View style={styles.basketBadge} pointerEvents="none">
        <CountBadge count={count} tone="danger" />
      </View>
    </View>
  );
}

type TabButtonProps = {
  index: number;
  activeIndex: SharedValue<number>;
  label: string;
  icon: IconName;
  badgeCount: number;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

function TabButton({
  index,
  activeIndex,
  label,
  icon,
  badgeCount,
  isFocused,
  onPress,
  onLongPress,
}: TabButtonProps) {
  /** 1 while this tab is active, 0 once the indicator has fully left it. */
  const weight = useDerivedValue(() =>
    Math.max(0, 1 - Math.abs(activeIndex.value - index)),
  );

  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: 1 + 0.08 * weight.value },
      { translateY: -2 * weight.value },
    ],
  }));

  // Two stacked layers crossfaded, because the glyph and the label change
  // colour together with the indicator rather than snapping on tap.
  const activeStyle = useAnimatedStyle(() => ({ opacity: weight.value }));
  const restingStyle = useAnimatedStyle(() => ({ opacity: 1 - weight.value }));

  const handlePress = useCallback(() => onPress(), [onPress]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={badgeCount > 0 ? `${label}, ${badgeCount} active` : label}
      onPress={handlePress}
      onLongPress={onLongPress}
      style={styles.tab}>
      <Animated.View style={[styles.tabContent, contentStyle]}>
        <View style={styles.glyph}>
          <Animated.View style={restingStyle}>
            <Icon name={icon} size={21} color={RESTING} />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, styles.center, activeStyle]}>
            <Icon name={icon} size={21} color={colors.primary} filled />
          </Animated.View>

          <View style={badgeAnchor} pointerEvents="none">
            <CountBadge count={badgeCount} tone="danger" />
          </View>
        </View>

        <View style={styles.labelBox}>
          <Animated.View style={restingStyle}>
            <AppText variant="label" color="textInverse" style={styles.resting} numberOfLines={1}>
              {label}
            </AppText>
          </Animated.View>
          <Animated.View style={[styles.activeLabel, activeStyle]}>
            <AppText variant="label" color="primary" numberOfLines={1}>
              {label}
            </AppText>
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    borderRadius: radii.xxl,
    // The shadow lives out here: the bar itself clips its children, and a
    // clipping view cannot cast one.
    ...shadows.floating,
  },
  bar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.xxl,
  },
  // Only the pane is clipped, so the basket button can keep its own shadow.
  glass: { borderRadius: radii.xxl, overflow: 'hidden' },

  tabs: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: INSET,
  },
  indicator: {
    position: 'absolute',
    top: INSET,
    bottom: INSET,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
  },

  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabContent: { alignItems: 'center', gap: 3 },
  glyph: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  labelBox: { alignItems: 'center', justifyContent: 'center' },
  // Given a few pixels of slack on each side: sized to exactly the resting
  // label's width, the active copy rounds down and ellipsises its last letter.
  activeLabel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -spacing.sm,
    right: -spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { alignItems: 'center', justifyContent: 'center' },

  basketSlot: {
    width: BASKET_SIZE + spacing.lg,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  basket: {
    width: BASKET_SIZE,
    height: BASKET_SIZE,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.raised,
  },
  basketPressed: { transform: [{ scale: 0.92 }] },
  basketBadge: { position: 'absolute', top: 2, right: spacing.sm },
  resting: { opacity: 0.8 },
  basketDivider: {
    position: 'absolute',
    left: 0,
    top: spacing.lg,
    bottom: spacing.lg,
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
});

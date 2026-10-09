import React, { memo, useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { colors, radii, shadows, spacing } from '../../theme';
import { AppText } from './Text';

export type SegmentedControlProps<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  /** For options that are ids rather than the words to show. */
  getLabel?: (option: T) => string;
  accessibilityLabel?: string;
};

/** Gap between the track's edge and the pill. */
const INSET = 4;

/** Decisive rather than bouncy — this is a filter, not a toy. */
const SPRING = { damping: 20, stiffness: 220, mass: 0.7 } as const;

type Rect = { x: number; width: number };

/**
 * A row of options with one selected, as a single track rather than loose chips.
 *
 * The selected option is a raised white pill that slides between positions, so
 * switching reads as one control changing state rather than two chips
 * independently turning on and off. Everything shares one recessed track,
 * which is what tells you at a glance that the options are alternatives and
 * exactly one of them is live.
 *
 * Segment widths come from layout rather than being fixed, so labels of very
 * different lengths each get the room they need.
 */
function SegmentedControlBase<T extends string>({
  options,
  value,
  onChange,
  getLabel,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const [rects, setRects] = useState<Record<string, Rect>>({});

  const x = useSharedValue(0);
  const width = useSharedValue(0);
  const ready = useSharedValue(0);

  const selected = rects[value];

  useEffect(() => {
    if (!selected) {
      return;
    }
    // The first measurement snaps; later changes slide.
    if (ready.value === 0) {
      x.value = selected.x;
      width.value = selected.width;
      ready.value = 1;
      return;
    }
    x.value = withSpring(selected.x, SPRING);
    width.value = withSpring(selected.width, SPRING);
  }, [selected, x, width, ready]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: width.value,
    opacity: ready.value,
    transform: [{ translateX: x.value }],
  }));

  const measure = useCallback(
    (option: T) => (event: LayoutChangeEvent) => {
      const { x: left, width: w } = event.nativeEvent.layout;
      setRects(current => {
        const existing = current[option];
        if (existing && existing.x === left && existing.width === w) {
          return current;
        }
        return { ...current, [option]: { x: left, width: w } };
      });
    },
    [],
  );

  return (
    <View accessibilityRole="tablist" accessibilityLabel={accessibilityLabel} style={styles.track}>
      {/* The track stays put and only its contents scroll. Scrolling the whole
          track instead would slide the grey pill off the screen edge, which
          reads as the control itself sliding away rather than as more options
          arriving. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        <Animated.View style={[styles.indicator, indicatorStyle]} />

        {options.map(option => {
          const isSelected = option === value;
          return (
            <Pressable
              key={option}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              onLayout={measure(option)}
              onPress={() => onChange(option)}
              style={styles.segment}>
              <AppText
                variant="captionStrong"
                color={isSelected ? 'text' : 'textMuted'}
                numberOfLines={1}>
                {getLabel ? getLabel(option) : option}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    padding: INSET,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },
  row: { flexDirection: 'row', position: 'relative', alignItems: 'stretch' },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    ...shadows.subtle,
  },
  segment: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const SegmentedControl = memo(SegmentedControlBase) as typeof SegmentedControlBase;

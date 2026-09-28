import React, { memo, useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, radii } from '../../theme';

export type SkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

/**
 * Loading placeholder. The pulse runs on the UI thread via Reanimated, so a
 * busy JS thread (parsing a feed response) never stutters the animation.
 */
function SkeletonBase({ width = '100%', height = 16, radius = radii.sm, style }: SkeletonProps) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 750 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[styles.base, { width, height, borderRadius: radius }, animatedStyle, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.surfaceMuted },
});

export const Skeleton = memo(SkeletonBase);

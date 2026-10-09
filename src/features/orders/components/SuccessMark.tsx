import React, { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '../../../components/ui';
import { colors, radii } from '../../../theme';

export type SuccessMarkProps = {
  size?: number;
};

/**
 * The confirmation moment.
 *
 * A static tick wastes the one screen in the flow that exists purely to say
 * "that worked". The mark lands with a spring overshoot and the two rings
 * push outwards once behind it, so the screen reads as something that just
 * happened rather than something that was already there when you arrived.
 *
 * It plays once on mount and then holds — a loop would turn a confirmation
 * into an animation to watch.
 */
function SuccessMarkBase({ size = 108 }: SuccessMarkProps) {
  const mark = useSharedValue(0);
  const innerRing = useSharedValue(0);
  const outerRing = useSharedValue(0);

  useEffect(() => {
    mark.value = withDelay(80, withSpring(1, { damping: 11, stiffness: 160 }));

    const ring = (delay: number) =>
      withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) }),
          withTiming(0.92, { duration: 260 }),
        ),
      );

    innerRing.value = ring(120);
    outerRing.value = ring(200);
  }, [mark, innerRing, outerRing]);

  const markStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mark.value }],
    opacity: mark.value,
  }));

  // Written out rather than built by a helper: a hook called from inside a
  // function is a rule-of-hooks trap waiting for the next person to edit it.
  // Scales settle at 1, so the rings never grow past the box this component
  // reserves and never reach the text below it.
  const inner = useAnimatedStyle(() => ({
    transform: [{ scale: 0.7 + innerRing.value * 0.3 }],
    opacity: innerRing.value * 0.6,
  }));

  const outer = useAnimatedStyle(() => ({
    transform: [{ scale: 0.7 + outerRing.value * 0.3 }],
    opacity: outerRing.value * 0.45,
  }));

  return (
    <View style={[styles.wrapper, { width: size * 1.7, height: size * 1.7 }]}>
      <Animated.View style={[styles.ring, { width: size * 1.7, height: size * 1.7 }, outer]} />
      <Animated.View style={[styles.ring, { width: size * 1.32, height: size * 1.32 }, inner]} />

      <Animated.View style={[styles.mark, { width: size, height: size }, markStyle]}>
        <Icon name="check" size={size * 0.5} color={colors.textInverse} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    borderRadius: radii.pill,
    backgroundColor: colors.successSurface,
  },
  mark: {
    borderRadius: radii.pill,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const SuccessMark = memo(SuccessMarkBase);

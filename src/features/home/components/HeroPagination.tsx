import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { radii, spacing } from '../../../theme';

export type HeroPaginationProps = {
  count: number;
  activeIndex: number;
  /** 0-1 through the current slide's dwell time. */
  progress: SharedValue<number>;
};

const DOT = 6;
const ACTIVE_WIDTH = 26;

/** Sits over photography, so the scale is white-on-dark rather than themed. */
const TRACK = 'rgba(255, 255, 255, 0.4)';
const FILL = '#FFFFFF';

/**
 * Progress pagination, drawn inside the banner.
 *
 * The active pill fills as its slide's time runs out, so the deck tells you
 * how long you have before it moves rather than changing without warning —
 * and because the fill and the advance are driven by the same value, the
 * hand-off lands exactly as the bar completes.
 */
function HeroPaginationBase({ count, activeIndex, progress }: HeroPaginationProps) {
  return (
    <View style={styles.row} pointerEvents="none">
      {Array.from({ length: count }, (_, index) =>
        index === activeIndex ? (
          <ActiveDot key={index} progress={progress} />
        ) : (
          <View key={index} style={styles.dot} />
        ),
      )}
    </View>
  );
}

function ActiveDot({ progress }: { progress: SharedValue<number> }) {
  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.min(Math.max(progress.value, 0), 1) * 100}%`,
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: radii.pill,
    backgroundColor: TRACK,
  },
  track: {
    width: ACTIVE_WIDTH,
    height: DOT,
    borderRadius: radii.pill,
    backgroundColor: TRACK,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radii.pill, backgroundColor: FILL },
});

export const HeroPagination = memo(HeroPaginationBase);

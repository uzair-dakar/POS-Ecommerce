import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Rect, G } from 'react-native-svg';

import { AppText } from '../../../components/ui';
import { colors, spacing } from '../../../theme';

export type EtaRingProps = {
  /** "15–20" or "12" — already formatted, since the range is the server's. */
  value: string;
  caption: string;
  /** 0-1 around the ring. */
  progress: number;
  size?: number;
};

/** Ticks around the full circle, and the gap left open at the bottom. */
const TICKS = 56;
const SWEEP = 300;
const START = 180 + (360 - SWEEP) / 2;

const TICK_WIDTH = 4;
const TICK_LENGTH = 17;

/**
 * The countdown ring.
 *
 * Drawn as discrete ticks rather than one smooth arc: a solid arc moving a
 * degree at a time is invisible, while a tick either is lit or is not, so each
 * step of progress is something you can actually see happen. Each tick is a
 * rounded rect rotated about the centre, which keeps the ends square to the
 * radius the way a dial's marks are.
 */
function EtaRingBase({ value, caption, progress, size = 232 }: EtaRingProps) {
  const lit = Math.round(Math.min(Math.max(progress, 0), 1) * TICKS);

  const ticks = useMemo(() => {
    const centre = size / 2;
    const radius = centre - TICK_LENGTH / 2 - 2;

    return Array.from({ length: TICKS }, (_, index) => {
      const angle = START + (index / (TICKS - 1)) * SWEEP;
      return {
        key: index,
        isLit: index < lit,
        // Place the tick at the top of the circle, then rotate it into position.
        transform: `rotate(${angle} ${centre} ${centre})`,
        x: centre - TICK_WIDTH / 2,
        y: centre - radius - TICK_LENGTH / 2,
      };
    });
  }, [lit, size]);

  return (
    <View
      accessible
      accessibilityLabel={`${value} ${caption}`}
      style={[styles.wrapper, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* The ring carries its own disc so it stays legible where it
            overlaps the map. */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - TICK_LENGTH - 4}
          fill={colors.surface}
        />
        <G>
          {ticks.map(tick => (
            <Rect
              key={tick.key}
              x={tick.x}
              y={tick.y}
              width={TICK_WIDTH}
              height={TICK_LENGTH}
              rx={TICK_WIDTH / 2}
              fill={tick.isLit ? colors.accent : colors.border}
              transform={tick.transform}
            />
          ))}
        </G>
      </Svg>

      <View style={styles.readout} pointerEvents="none">
        <AppText variant="display" style={styles.value}>
          {value}
        </AppText>
        <AppText variant="caption" color="textMuted" align="center">
          {caption}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
  readout: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  // Larger than any other number in the app: on this screen it is the answer
  // to the only question being asked.
  value: { fontSize: 46, lineHeight: 54, letterSpacing: -1.5 },
});

export const EtaRing = memo(EtaRingBase);

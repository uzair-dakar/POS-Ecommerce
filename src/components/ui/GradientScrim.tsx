import React, { memo } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export type GradientScrimProps = {
  /** Where the darkness is heaviest. */
  from?: 'bottom' | 'top' | 'left';
  /** Opacity at the heavy end, 0-1. */
  intensity?: number;
  /** Brand navy by default; pass a colour to tint the wash. */
  color?: string;
  style?: ViewStyle;
};

const NAVY = '#06283F';

/**
 * A real gradient wash for text sitting over photography.
 *
 * A flat translucent block dims the whole picture evenly, which is what makes
 * a banner look cheap — the photo goes muddy and the text still fights it.
 * This ramps from opaque at the text end to clear at the other, with a
 * weighted midpoint so the falloff reads as light rather than a linear smear.
 */
function GradientScrimBase({
  from = 'bottom',
  intensity = 0.88,
  color = NAVY,
  style,
}: GradientScrimProps) {
  const direction =
    from === 'bottom'
      ? { x1: '0', y1: '1', x2: '0', y2: '0' }
      : from === 'top'
        ? { x1: '0', y1: '0', x2: '0', y2: '1' }
        : { x1: '0', y1: '0', x2: '1', y2: '0' };

  return (
    <Svg style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Defs>
        <LinearGradient id="scrim" {...direction}>
          <Stop offset="0" stopColor={color} stopOpacity={intensity} />
          <Stop offset="0.45" stopColor={color} stopOpacity={intensity * 0.55} />
          <Stop offset="0.78" stopColor={color} stopOpacity={intensity * 0.16} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#scrim)" />
    </Svg>
  );
}

export const GradientScrim = memo(GradientScrimBase);

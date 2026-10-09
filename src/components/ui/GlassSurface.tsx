import React, { memo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export type GlassSurfaceProps = {
  /** Opacity of the wash at the top and bottom of the pane. */
  from?: number;
  to?: number;
  tint?: string;
  /** The bright lip along the top edge that reads as light catching glass. */
  highlight?: boolean;
  highlightColor?: string;
  style?: ViewStyle;
};

const WHITE = '255, 255, 255';

/** Brand navy, for panes that sit over busy or light content. */
export const GLASS_NAVY = '10, 46, 74';

/**
 * A frosted pane to sit over moving content.
 *
 * There is no backdrop blur here: neither platform exposes one to React
 * Native, and the community binding does not apply its props under the new
 * architecture. So the depth comes from the wash instead, and a dark tint does
 * that far better than a light one — content passing underneath loses its
 * contrast against dark glass and reads as movement, where under light glass
 * it stays legible and the pane looks like a dirty window.
 *
 * The wash ramps rather than sitting flat: an even wash looks like a sheet of
 * plastic, while a gradient reads as light falling across a surface. The
 * hairline on top is the lip catching that light.
 */
function GlassSurfaceBase({
  from = 0.88,
  to = 0.97,
  tint = WHITE,
  highlight = true,
  highlightColor = 'rgba(255, 255, 255, 0.85)',
  style,
}: GlassSurfaceProps) {
  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={`rgb(${tint})`} stopOpacity={from} />
            <Stop offset="0.55" stopColor={`rgb(${tint})`} stopOpacity={(from + to) / 2} />
            <Stop offset="1" stopColor={`rgb(${tint})`} stopOpacity={to} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#glass)" />
      </Svg>

      {highlight ? (
        <View style={[styles.highlight, { backgroundColor: highlightColor }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
});

export const GlassSurface = memo(GlassSurfaceBase);

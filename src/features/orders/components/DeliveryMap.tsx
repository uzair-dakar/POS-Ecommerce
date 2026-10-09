import React, { memo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { AppText, Icon } from '../../../components/ui';
import { colors, radii, shadows, spacing } from '../../../theme';

export type DeliveryMapProps = {
  /** 0-1 along the route, from the merchant to the door. */
  progress: number;
  merchantName: string;
  style?: ViewStyle;
};

/**
 * The map behind the tracking screen.
 *
 * Deliberately a drawn stand-in rather than a real map: a live one needs a
 * maps SDK and a billed API key, and neither belongs in a mock. It is shaped
 * like the real thing — water, parks, a road grid, the route from the kitchen
 * to the door, and the courier somewhere along it — so the screen above can be
 * built and judged now, and swapping in a MapView later changes only this
 * file.
 */
const PALETTE = {
  land: '#EDF0EA',
  park: '#DCE9D5',
  water: '#C9E2EF',
  road: '#FFFFFF',
  roadEdge: '#E2E2DD',
};

/** The courier's path, in the SVG's own 320x400 space. */
const ROUTE = 'M72 318 C 120 300, 150 250, 168 212 S 214 128, 254 96';

function pointOnRoute(progress: number) {
  // Sampled from the same curve the route is drawn with, so the marker always
  // sits on the line rather than near it.
  const t = Math.min(Math.max(progress, 0), 1);
  const curve = [
    [72, 318],
    [110, 296],
    [142, 262],
    [164, 222],
    [186, 178],
    [214, 136],
    [254, 96],
  ];
  const span = (curve.length - 1) * t;
  const index = Math.min(Math.floor(span), curve.length - 2);
  const local = span - index;
  const [x1, y1] = curve[index];
  const [x2, y2] = curve[index + 1];
  return { x: x1 + (x2 - x1) * local, y: y1 + (y2 - y1) * local };
}

function DeliveryMapBase({ progress, merchantName, style }: DeliveryMapProps) {
  const courier = pointOnRoute(progress);

  return (
    <View style={[styles.wrapper, style]}>
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 320 400" preserveAspectRatio="xMidYMid slice">
        <Rect x="0" y="0" width="320" height="400" fill={PALETTE.land} />

        <Path d="M0 250 C 40 240, 60 300, 40 400 L0 400 Z" fill={PALETTE.water} />
        <Path d="M196 0 C 250 20, 300 10, 320 0 L320 70 C 270 60, 220 50, 196 24 Z" fill={PALETTE.water} />

        <Rect x="30" y="60" width="92" height="70" rx="10" fill={PALETTE.park} />
        <Rect x="212" y="214" width="86" height="94" rx="10" fill={PALETTE.park} />

        {/* Road grid: a wide white stroke with a soft edge beneath reads as a
            street without needing any real geometry. */}
        {[52, 120, 188, 256].map(y => (
          <Rect key={`h${y}`} x="0" y={y} width="320" height="9" fill={PALETTE.roadEdge} />
        ))}
        {[52, 120, 188, 256].map(y => (
          <Rect key={`hr${y}`} x="0" y={y + 1} width="320" height="7" fill={PALETTE.road} />
        ))}
        {[64, 150, 236].map(x => (
          <Rect key={`v${x}`} x={x} y="0" width="9" height="400" fill={PALETTE.roadEdge} />
        ))}
        {[64, 150, 236].map(x => (
          <Rect key={`vr${x}`} x={x + 1} y="0" width="7" height="400" fill={PALETTE.road} />
        ))}

        <Path
          d={ROUTE}
          stroke={colors.primary}
          strokeOpacity={0.18}
          strokeWidth={9}
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d={ROUTE}
          stroke={colors.accent}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray="1 11"
          fill="none"
        />

        <Circle cx={courier.x} cy={courier.y} r={11} fill={colors.accent} opacity={0.25} />
        <Circle cx={courier.x} cy={courier.y} r={6} fill={colors.accent} />
      </Svg>

      {/* Markers sit above the drawing so they can use real type and icons. */}
      <View style={styles.merchantPin}>
        <View style={styles.pinBubble}>
          <Icon name="store" size={16} color={colors.textInverse} filled />
        </View>
        <AppText variant="label" color="text" numberOfLines={1} style={styles.pinLabel}>
          {merchantName}
        </AppText>
      </View>

      <View style={styles.homePin}>
        <Icon name="home" size={18} color={colors.primary} filled />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { overflow: 'hidden', backgroundColor: PALETTE.land },

  merchantPin: { position: 'absolute', top: '18%', right: '14%', alignItems: 'center' },
  pinBubble: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: colors.surface,
    ...shadows.card,
  },
  pinLabel: {
    marginTop: spacing.xs,
    maxWidth: 110,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },

  homePin: {
    position: 'absolute',
    bottom: '14%',
    left: '14%',
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
});

export const DeliveryMap = memo(DeliveryMapBase);

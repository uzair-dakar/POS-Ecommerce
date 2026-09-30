import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppText, Icon } from '../../../components/ui';
import { colors, radii, spacing } from '../../../theme';

export type EtaRingProps = {
  minutes: number;
  /** 0-1 around the ring. */
  progress: number;
  label: string;
  size?: number;
};

const STROKE = 14;

/**
 * The countdown ring on the tracking screen. Drawn with SVG's stroke-dash
 * rather than an animated view, so the arc stays exact at any progress and
 * costs one node instead of a stack of masks.
 */
function EtaRingBase({ minutes, progress, label, size = 210 }: EtaRingProps) {
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surfaceMuted}
          strokeWidth={STROKE}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.accent}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${circumference}`}
          // Start the arc at 12 o'clock instead of 3.
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.center}>
        <View style={styles.badge}>
          <Icon name="bike" size={20} color={colors.accentPressed} />
        </View>
        <View style={styles.readout}>
          <AppText variant="display">{minutes}</AppText>
          <AppText variant="body" color="textMuted">
            min
          </AppText>
        </View>
        <AppText variant="body" color="textMuted">
          {label}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  badge: {
    width: 46,
    height: 46,
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readout: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
});

export const EtaRing = memo(EtaRingBase);

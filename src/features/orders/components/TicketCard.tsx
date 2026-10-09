import React, { memo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radii, shadows, spacing } from '../../../theme';

export type TicketCardProps = {
  /** Above the perforation — the headline half. */
  header: ReactNode;
  /** Below it — the details half. */
  body: ReactNode;
  /** Matches whatever the card sits on, since the notches are cut from it. */
  notchColor?: string;
};

const NOTCH = 18;

/**
 * A card split by a perforation, with a notch bitten out of each edge.
 *
 * The shape is doing the explaining: a receipt is a thing you were handed and
 * can keep, which is exactly what a confirmation is. The notches are circles
 * in the page colour sitting half outside the card — the card is not clipped,
 * so they read as holes punched through it.
 */
function TicketCardBase({ header, body, notchColor = colors.background }: TicketCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.section}>{header}</View>

      <View style={styles.perforation}>
        <View style={[styles.notch, styles.notchLeft, { backgroundColor: notchColor }]} />
        <View style={styles.dashes} />
        <View style={[styles.notch, styles.notchRight, { backgroundColor: notchColor }]} />
      </View>

      <View style={styles.section}>{body}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  section: { padding: spacing.lg },

  perforation: { height: NOTCH, justifyContent: 'center' },
  dashes: {
    marginHorizontal: NOTCH,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderTopColor: colors.border,
  },
  notch: {
    position: 'absolute',
    width: NOTCH,
    height: NOTCH,
    borderRadius: radii.pill,
  },
  notchLeft: { left: -NOTCH / 2 },
  notchRight: { right: -NOTCH / 2 },
});

export const TicketCard = memo(TicketCardBase);

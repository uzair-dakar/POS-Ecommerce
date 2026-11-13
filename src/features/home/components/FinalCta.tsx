import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon } from '../../../components/ui';
import { colors, radii, SCREEN_GUTTER, shadows, spacing } from '../../../theme';

export type FinalCtaProps = {
  onPress: () => void;
};

/**
 * The panel that closes the feed.
 *
 * It repeats the storefront's pitch at the one moment a shopper has seen
 * everything and still not tapped — so it is the only place on the feed that
 * invites browsing rather than naming something specific.
 */
function FinalCtaBase({ onPress }: FinalCtaProps) {
  return (
    <View style={styles.panel}>
      {/* The web's decorative glows, as two soft discs bleeding off the edge. */}
      <View style={[styles.glow, styles.glowTop]} />
      <View style={[styles.glow, styles.glowBottom]} />

      <View style={styles.eyebrowRow}>
        <Icon name="bolt" size={12} color={colors.accentBright} filled />
        <AppText variant="eyebrow" color="accentBright">
          Your neighbourhood, delivered
        </AppText>
      </View>

      <AppText variant="h1" color="textInverse">
        Whatever you're craving, it's closer than you think.
      </AppText>

      <AppText variant="caption" color="textInverse" style={styles.body}>
        Browse local restaurants, grocery stores, markets and everyday essentials — all in one
        place.
      </AppText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Start exploring"
        onPress={onPress}
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
        <AppText variant="button" color="textInverse">
          Start exploring
        </AppText>
        <Icon name="arrowRight" size={16} color={colors.textInverse} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginHorizontal: SCREEN_GUTTER,
    padding: spacing.xxl,
    borderRadius: radii.xxl,
    backgroundColor: colors.primaryDark,
    overflow: 'hidden',
    gap: spacing.sm,
    ...shadows.raised,
  },
  glow: {
    position: 'absolute',
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    opacity: 0.14,
  },
  glowTop: { width: 200, height: 200, top: -96, right: -72 },
  glowBottom: { width: 220, height: 220, bottom: -130, right: 60 },

  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  body: { opacity: 0.6, marginTop: spacing.xs },
  cta: {
    marginTop: spacing.lg,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.accent,
  },
  pressed: { opacity: 0.9 },
});

export const FinalCta = memo(FinalCtaBase);

import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Icon, type IconName } from '../../../components/ui';
import { colors, radii, SCREEN_GUTTER, shadows, spacing } from '../../../theme';

type Feature = { icon: IconName; title: string; text: string };

const FEATURES: readonly Feature[] = [
  { icon: 'bike', title: 'Fast delivery', text: 'From nearby stores' },
  { icon: 'shield', title: 'Trusted quality', text: 'Carefully selected' },
  { icon: 'leaf', title: 'Fresh every day', text: 'Local favourites' },
  { icon: 'bag', title: 'Everything nearby', text: 'Food, groceries & more' },
];

/**
 * The four promises under the hero.
 *
 * The web storefront lays them out as one wide strip; on a phone that would
 * either wrap mid-phrase or shrink the type below reading size, so the same
 * four sit two-up in a single card — the strip's framing kept, its rhythm
 * adapted.
 */
function FeatureStripBase() {
  return (
    <View style={styles.card}>
      {FEATURES.map(feature => (
        <View key={feature.title} style={styles.feature}>
          <View style={styles.iconPlate}>
            <Icon name={feature.icon} size={17} color={colors.accent} />
          </View>

          <View style={styles.copy}>
            <AppText variant="captionStrong" numberOfLines={1}>
              {feature.title}
            </AppText>
            <AppText variant="label" color="textMuted" numberOfLines={1}>
              {feature.text}
            </AppText>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SCREEN_GUTTER,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.lg,
    ...shadows.subtle,
  },
  // Two per row, so each phrase has the width to stay on one line.
  feature: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  iconPlate: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSurface,
  },
  copy: { flexShrink: 1 },
});

export const FeatureStrip = memo(FeatureStripBase);

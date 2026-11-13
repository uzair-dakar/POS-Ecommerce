import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppImage, AppText } from '../../../components/ui';
import { colors, radii, SCREEN_GUTTER, shadows, spacing } from '../../../theme';
import { ESSENTIAL_TILES, type EssentialTile } from '../homeContent';

export type EssentialsGridProps = {
  onSelect: (tile: EssentialTile) => void;
};

/**
 * "Essentials" — six shortcuts into a business type's shops.
 *
 * Three across rather than the web's six, which is what keeps the product
 * renders large enough to recognise at a glance on a phone while still
 * fitting all six without a scroll.
 */
function EssentialsGridBase({ onSelect }: EssentialsGridProps) {
  return (
    <View style={styles.grid}>
      {ESSENTIAL_TILES.map(tile => (
        <Pressable
          key={tile.slug}
          accessibilityRole="button"
          accessibilityLabel={tile.name}
          onPress={() => onSelect(tile)}
          style={({ pressed }) => [styles.cell, pressed && styles.pressed]}>
          <View style={styles.card}>
            <AppImage source={tile.art} style={styles.art} resizeMode="contain" />
          </View>

          <AppText variant="label" align="center" numberOfLines={2}>
            {tile.name}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: SCREEN_GUTTER,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.lg,
  },
  cell: { width: '33.333%', paddingHorizontal: spacing.xs, gap: spacing.sm },
  card: {
    aspectRatio: 1,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.subtle,
  },
  // The renders are cut out on transparency, so the card's white has to show
  // through rather than the image component's grey placeholder.
  art: { flex: 1, backgroundColor: colors.transparent },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
});

export const EssentialsGrid = memo(EssentialsGridBase);

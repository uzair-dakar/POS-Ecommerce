import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppImage, AppText, Icon } from '../../../components/ui';
import { colors, radii, shadows, spacing } from '../../../theme';
import type { Chain } from '../../../types';

export const BRAND_CARD_WIDTH = 108;

export type BrandCardProps = {
  chain: Chain;
  onPress: (chain: Chain) => void;
};

/** Logo tile in the "Brands you love" row; opens the brand's locations. */
function BrandCardBase({ chain, onPress }: BrandCardProps) {
  const handlePress = useCallback(() => onPress(chain), [onPress, chain]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${chain.name}, ${chain.locationCount} locations`}
      onPress={handlePress}
      style={({ pressed }) => [styles.wrapper, pressed && styles.pressed]}>
      <View style={styles.logoHost}>
        <AppImage source={{ uri: chain.logoUrl }} style={styles.logo} />
      </View>
      <View style={styles.labelRow}>
        <AppText variant="captionStrong" numberOfLines={1} style={styles.name}>
          {chain.name}
        </AppText>
        <View style={styles.chevron}>
          <Icon name="chevronRight" size={12} color={colors.accentPressed} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: BRAND_CARD_WIDTH, gap: spacing.sm },
  logoHost: {
    width: BRAND_CARD_WIDTH,
    height: 96,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  logo: { width: '100%', height: '100%', borderRadius: radii.md },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { flexShrink: 1 },
  chevron: {
    width: 22,
    height: 22,
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
});

export const BrandCard = memo(
  BrandCardBase,
  (prev, next) => prev.chain === next.chain && prev.onPress === next.onPress,
);

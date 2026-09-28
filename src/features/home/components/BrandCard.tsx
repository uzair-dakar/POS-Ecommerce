import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppImage, AppText, Icon } from '../../../components/ui';
import { colors, radii, spacing } from '../../../theme';
import type { Chain } from '../../../types';

export const BRAND_CARD_WIDTH = 108;

export type BrandCardProps = {
  chain: Chain;
  onPress: (chain: Chain) => void;
};

/** Logo tile in the "Brands you love" row. */
function BrandCardBase({ chain, onPress }: BrandCardProps) {
  return (
    <View style={styles.wrapper}>
      <AppImage source={{ uri: chain.logoUrl }} style={styles.logo} />
      <View style={styles.labelRow}>
        <AppText variant="captionStrong" numberOfLines={1} style={styles.name}>
          {chain.name}
        </AppText>
        <View style={styles.chevron}>
          <Icon name="chevronRight" size={12} color={colors.accentPressed} strokeWidth={2.4} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: BRAND_CARD_WIDTH, gap: spacing.sm },
  logo: { width: BRAND_CARD_WIDTH, height: 96, borderRadius: radii.md },
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
});

export const BrandCard = memo(BrandCardBase, (prev, next) => prev.chain.id === next.chain.id);

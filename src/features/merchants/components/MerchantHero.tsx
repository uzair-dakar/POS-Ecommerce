import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppImage, AppText, Dot, IconButton, Rating } from '../../../components/ui';
import { colors, radii, SCREEN_GUTTER, shadows, spacing } from '../../../theme';
import { formatPrice } from '../../../utils';
import type { MerchantDetail } from '../../../types';

export type MerchantHeroProps = {
  detail: MerchantDetail;
  onSearch?: () => void;
};

/** Photo, logo badge and the merchant's headline facts. */
function MerchantHeroBase({ detail, onSearch }: MerchantHeroProps) {
  const navigation = useNavigation();
  const { merchant } = detail;

  return (
    <View>
      <View style={styles.hero}>
        <AppImage source={{ uri: merchant.imageUrl }} style={styles.heroImage} />
        <View style={styles.heroBar}>
          <IconButton
            name="arrowLeft"
            accessibilityLabel="Go back"
            onPress={navigation.goBack}
          />
          <View style={styles.heroActions}>
            {onSearch ? (
              <IconButton
                name="search"
                accessibilityLabel={`Search in ${merchant.name}`}
                onPress={onSearch}
              />
            ) : null}
            <IconButton name="heart" accessibilityLabel="Add to favourites" onPress={() => {}} />
          </View>
        </View>
      </View>

      <View style={styles.sheet}>
        {merchant.logoUrl ? (
          <AppImage source={{ uri: merchant.logoUrl }} style={styles.logo} />
        ) : null}

        <AppText variant="h1">{merchant.name}</AppText>

        <View style={styles.factRow}>
          <View style={styles.fact}>
            <Dot color={merchant.isOpen ? colors.success : colors.danger} />
            <AppText variant="captionStrong" color={merchant.isOpen ? 'success' : 'danger'}>
              {merchant.isOpen ? `Open until ${merchant.closesAt}` : 'Closed'}
            </AppText>
          </View>
          <AppText variant="caption" color="textSubtle">
            ·
          </AppText>
          <Rating value={merchant.rating} />
          <AppText variant="caption" color="textSubtle">
            ·
          </AppText>
          <AppText variant="caption" color="textMuted">
            Min. order {formatPrice(merchant.minOrder)}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 220, backgroundColor: colors.primaryDark },
  heroImage: { ...StyleSheet.absoluteFill },
  heroBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SCREEN_GUTTER,
  },
  heroActions: { flexDirection: 'row', gap: spacing.sm },

  // Lifts over the photo, matching the rounded sheet in the design.
  sheet: {
    marginTop: -spacing.xxl,
    paddingHorizontal: SCREEN_GUTTER,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  logo: {
    width: 66,
    height: 66,
    borderRadius: radii.lg,
    marginTop: -(spacing.huge + spacing.md),
    borderWidth: 3,
    borderColor: colors.surface,
    ...shadows.card,
  },
  factRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  fact: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});

export const MerchantHero = memo(MerchantHeroBase);

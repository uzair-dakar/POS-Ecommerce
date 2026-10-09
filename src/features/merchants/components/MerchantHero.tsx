import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

import { AppImage, AppText, Dot, IconButton, Rating } from '../../../components/ui';
import { colors, radii, SCREEN_GUTTER, shadows, spacing } from '../../../theme';
import { formatPrice } from '../../../utils';
import type { MerchantDetail } from '../../../types';

export type MerchantHeroProps = {
  detail: MerchantDetail;
  onSearch?: () => void;
};

const HERO_HEIGHT = 230;
const SWEEP_HEIGHT = 28;
const LOGO_SIZE = 76;

/**
 * The curve the page rises on.
 *
 * Drawn in a 100-wide viewBox and stretched, so one path works at any screen
 * width. A straight edge with rounded corners cuts the photo off; a sweep that
 * lifts towards the middle hands it over, and gives the logo a crest to sit on
 * instead of a line to straddle.
 *
 * Kept shallow on purpose: enough of a rise to read as a curve, not so much
 * that it becomes the thing you notice about the page.
 */
function Sweep() {
  return (
    <Svg
      style={styles.sweep}
      width="100%"
      height={SWEEP_HEIGHT}
      viewBox="0 0 100 28"
      preserveAspectRatio="none">
      <Path d="M0,28 L0,20 C30,1 70,1 100,20 L100,28 Z" fill={colors.background} />
    </Svg>
  );
}

/** Photo, logo and the merchant's headline facts. */
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

        <Sweep />
      </View>

      <View style={styles.sheet}>
        {merchant.logoUrl ? (
          <View style={styles.logoTile}>
            <AppImage source={{ uri: merchant.logoUrl }} style={styles.logo} />
          </View>
        ) : null}

        <AppText variant="h1" align="center">
          {merchant.name}
        </AppText>

        {/* One centred line of facts rather than a left-aligned row: under a
            centred name and logo, anything flush left reads as a different
            block that happens to sit nearby. */}
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
            Min. {formatPrice(merchant.minOrder)}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: HERO_HEIGHT, backgroundColor: colors.primaryDark },
  heroImage: { ...StyleSheet.absoluteFill },
  heroBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SCREEN_GUTTER,
  },
  heroActions: { flexDirection: 'row', gap: spacing.sm },
  sweep: { position: 'absolute', left: 0, right: 0, bottom: 0 },

  sheet: {
    alignItems: 'center',
    paddingHorizontal: SCREEN_GUTTER,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  // Rides the crest of the sweep: a white tile around the mark, so a logo with
  // its own background still reads as one object sitting on the page.
  logoTile: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    marginTop: -(LOGO_SIZE / 2 + spacing.sm),
    marginBottom: spacing.xs,
    padding: spacing.xs,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    ...shadows.raised,
  },
  logo: { flex: 1, borderRadius: radii.md },

  factRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  fact: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});

export const MerchantHero = memo(MerchantHeroBase);

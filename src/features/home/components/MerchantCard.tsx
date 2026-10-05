import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppImage, AppText, Icon } from '../../../components/ui';
import { colors, radii, spacing, surfaces } from '../../../theme';
import { formatDeliveryFee, formatDeliveryWindow } from '../../../utils';
import type { Merchant } from '../../../types';

export const MERCHANT_CARD_WIDTH = 248;

export type MerchantCardProps = {
  merchant: Merchant;
  /** 'compact' is the carousel card; 'wide' fills the screen width. */
  layout?: 'compact' | 'wide';
  isFavourite?: boolean;
  onPress: (merchant: Merchant) => void;
  onToggleFavourite?: (merchant: Merchant) => void;
};

/**
 * Store card.
 *
 * Follows the reference app's anatomy: photo, then name and one line of
 * description, then a dashed rule, then a single facts row carrying delivery
 * fee, time and score. Putting every number on one rule-separated line is what
 * makes a row of these scannable — the eye reads down one column, not around
 * each card.
 */
function MerchantCardBase({
  merchant,
  layout = 'compact',
  isFavourite = false,
  onPress,
  onToggleFavourite,
}: MerchantCardProps) {
  const handlePress = useCallback(() => onPress(merchant), [onPress, merchant]);
  const handleFavourite = useCallback(
    () => onToggleFavourite?.(merchant),
    [onToggleFavourite, merchant],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={merchant.name}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        layout === 'compact' ? { width: MERCHANT_CARD_WIDTH } : styles.wide,
        pressed && styles.pressed,
      ]}>
      <View>
        <AppImage source={{ uri: merchant.imageUrl }} style={styles.image} />

        {merchant.offerLabel ? (
          <View style={styles.offer}>
            <Icon name="percent" size={12} color={colors.accentPressed} strokeWidth={2.4} />
            <AppText variant="label" color="accentPressed" numberOfLines={1}>
              {merchant.offerLabel}
            </AppText>
          </View>
        ) : null}

        {onToggleFavourite ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
            hitSlop={10}
            onPress={handleFavourite}
            style={({ pressed }) => [styles.favourite, pressed && styles.favouritePressed]}>
            <Icon
              name="heart"
              size={16}
              color={isFavourite ? colors.danger : colors.text}
              filled={isFavourite}
            />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.body}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {merchant.name}
        </AppText>
        <AppText variant="caption" color="textMuted" numberOfLines={1}>
          {merchant.tagline}
        </AppText>
      </View>

      <View style={styles.divider} />

      <View style={styles.facts}>
        <Icon name="bike" size={15} color={colors.accentPressed} />
        <AppText variant="priceSmall" color="text">
          {formatDeliveryFee(merchant.deliveryFee)}
        </AppText>

        <AppText variant="priceSmall" color="textSubtle">
          ·
        </AppText>
        <AppText variant="priceSmall" color="textMuted">
          {formatDeliveryWindow(merchant.deliveryMinMinutes, merchant.deliveryMaxMinutes)}
        </AppText>

        <AppText variant="priceSmall" color="textSubtle">
          ·
        </AppText>
        <Icon name="star" size={13} color={colors.accentBright} filled />
        <AppText variant="priceSmall" color="text">
          {merchant.rating.toFixed(1)}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { ...surfaces.card, overflow: 'hidden', paddingBottom: spacing.md },
  wide: { alignSelf: 'stretch' },
  image: { height: 132 },

  offer: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    maxWidth: '85%',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
  },
  favourite: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favouritePressed: { transform: [{ scale: 0.9 }] },

  body: { paddingHorizontal: spacing.md, paddingTop: spacing.md, gap: 1 },

  // Dashed, like the reference: it separates the facts without reading as a
  // second card edge the way a solid rule does.
  divider: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: colors.border,
  },
  facts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  pressed: { opacity: 0.94, transform: [{ scale: 0.99 }] },
});

/**
 * Cards are pure: re-render only when the merchant itself or its favourite
 * state changes, not when a sibling row updates.
 */
export const MerchantCard = memo(
  MerchantCardBase,
  (prev, next) =>
    prev.merchant === next.merchant &&
    prev.isFavourite === next.isFavourite &&
    prev.layout === next.layout,
);

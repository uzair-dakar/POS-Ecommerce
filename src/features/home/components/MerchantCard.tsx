import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppImage, AppText, Badge, Icon, MetaRow } from '../../../components/ui';
import { colors, radii, shadows, spacing } from '../../../theme';
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
          <Badge label={merchant.offerLabel} tone="info" style={styles.offer} />
        ) : null}

        {onToggleFavourite ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
            hitSlop={spacing.sm}
            onPress={handleFavourite}
            style={styles.favourite}>
            <Icon
              name="heart"
              size={17}
              color={isFavourite ? colors.danger : colors.text}
              filled={isFavourite}
            />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.body}>
        <AppText variant="h3" numberOfLines={1}>
          {merchant.name}
        </AppText>
        <AppText variant="caption" color="textMuted" numberOfLines={1}>
          {merchant.tagline}
        </AppText>
      </View>

      <View style={styles.footer}>
        <MetaRow
          items={[
            { icon: 'bike', label: formatDeliveryFee(merchant.deliveryFee) },
            {
              icon: 'clock',
              label: formatDeliveryWindow(merchant.deliveryMinMinutes, merchant.deliveryMaxMinutes),
            },
            { icon: 'star', label: merchant.rating.toFixed(1) },
          ]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  wide: { alignSelf: 'stretch' },
  image: { height: 132 },
  offer: { position: 'absolute', top: spacing.sm, left: spacing.sm, backgroundColor: colors.surface },
  favourite: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 30,
    height: 30,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: spacing.md, paddingTop: spacing.md, gap: spacing.xxs },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    borderStyle: 'dashed',
  },
  pressed: { opacity: 0.92 },
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

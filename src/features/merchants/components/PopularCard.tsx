import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppImage, AppText, Icon } from '../../../components/ui';
import { colors, radii, spacing, surfaces } from '../../../theme';
import { formatPrice } from '../../../utils';
import type { Product } from '../../../types';

export const POPULAR_CARD_WIDTH = 142;

const IMAGE_HEIGHT = 96;
const ADD_SIZE = 30;

export type PopularCardProps = {
  product: Product;
  quantityInBasket: number;
  onPress: (product: Product) => void;
  onAdd: (product: Product) => void;
};

/**
 * A dish in the "Most ordered" rail.
 *
 * Deliberately not the grid tile at a narrower width: a card in a rail is
 * glanced at on the way past, so it carries only the photo, the name and the
 * price, and its type is set for that size rather than scaled down from a
 * full-width row — type that was chosen for a wide card always looks oversized
 * once the card gets small.
 */
function PopularCardBase({ product, quantityInBasket, onPress, onAdd }: PopularCardProps) {
  const handlePress = useCallback(() => onPress(product), [onPress, product]);
  const handleAdd = useCallback(() => onAdd(product), [onAdd, product]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatPrice(product.price)}`}
      onPress={handlePress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.media}>
        <AppImage source={{ uri: product.imageUrl }} style={styles.image} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add ${product.name}`}
          hitSlop={8}
          onPress={handleAdd}
          style={({ pressed }) => [styles.add, pressed && styles.addPressed]}>
          {quantityInBasket > 0 ? (
            <AppText variant="label" color="textInverse">
              {quantityInBasket}
            </AppText>
          ) : (
            <Icon name="plus" size={14} color={colors.textInverse} />
          )}
        </Pressable>
      </View>

      <View style={styles.body}>
        <AppText variant="caption" numberOfLines={2} style={styles.name}>
          {product.name}
        </AppText>
        <AppText variant="captionStrong">{formatPrice(product.price)}</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { width: POPULAR_CARD_WIDTH, ...surfaces.card },
  media: { height: IMAGE_HEIGHT },
  image: {
    height: IMAGE_HEIGHT,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
  },
  add: {
    position: 'absolute',
    right: spacing.sm,
    bottom: -(ADD_SIZE / 2),
    width: ADD_SIZE,
    height: ADD_SIZE,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  addPressed: { transform: [{ scale: 0.92 }] },

  body: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.sm + 2,
    paddingBottom: spacing.sm + 2,
    gap: spacing.xxs,
  },
  // Two short lines sit better than one clipped one at this width.
  name: { minHeight: 38 },
  pressed: { opacity: 0.9 },
});

export const PopularCard = memo(PopularCardBase);

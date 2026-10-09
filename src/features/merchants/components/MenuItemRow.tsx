import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppImage, AppText, Badge, Icon } from '../../../components/ui';
import { colors, radii, spacing, surfaces } from '../../../theme';
import { formatPrice } from '../../../utils';
import type { Product } from '../../../types';

export type MenuItemRowProps = {
  product: Product;
  /** How many of this item are already in the basket, if any. */
  quantityInBasket?: number;
  onPress: (product: Product) => void;
};

/** A restaurant menu line: copy on the left, photo and add button right. */
function MenuItemRowBase({ product, quantityInBasket = 0, onPress }: MenuItemRowProps) {
  const handlePress = useCallback(() => onPress(product), [onPress, product]);
  const isInBasket = quantityInBasket > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatPrice(product.price)}`}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        isInBasket && styles.rowInBasket,
        pressed && styles.pressed,
      ]}>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          {isInBasket ? (
            <AppText variant="captionStrong" color="textAccent">
              {quantityInBasket}×
            </AppText>
          ) : null}
          <AppText variant="bodyStrong" numberOfLines={1} style={styles.name}>
            {product.name}
          </AppText>
        </View>

        <AppText variant="caption" color="textMuted" numberOfLines={2}>
          {product.description}
        </AppText>

        <View style={styles.priceRow}>
          <AppText variant="price">{formatPrice(product.price)}</AppText>
          {product.isPopular ? <Badge label="Popular" tone="accent" /> : null}
        </View>
      </View>

      <View>
        <AppImage source={{ uri: product.imageUrl }} style={styles.image} />
        <View style={styles.add}>
          <Icon name="plus" size={16} color={colors.textInverse} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    ...surfaces.outlined,
  },
  // Items already in the basket get the accent ring from the design.
  rowInBasket: { borderColor: colors.accent },
  body: { flex: 1, gap: spacing.xs, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  name: { flexShrink: 1 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xxs },
  image: { width: 84, height: 84, borderRadius: radii.md },
  add: {
    position: 'absolute',
    right: -spacing.xs,
    bottom: -spacing.xs,
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  pressed: { opacity: 0.9 },
});

export const MenuItemRow = memo(
  MenuItemRowBase,
  (prev, next) =>
    prev.product === next.product &&
    prev.quantityInBasket === next.quantityInBasket &&
    prev.onPress === next.onPress,
);

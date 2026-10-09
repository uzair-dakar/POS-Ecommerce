import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppImage, AppText, Badge, Icon, QuantityStepper } from '../../../components/ui';
import { colors, radii, spacing, surfaces } from '../../../theme';
import { formatPrice, formatUnitPrice } from '../../../utils';
import type { Product } from '../../../types';

export type GroceryTileProps = {
  product: Product;
  quantityInBasket: number;
  onPress: (product: Product) => void;
  onAdd: (product: Product) => void;
  onChangeQuantity: (product: Product, quantity: number) => void;
};

/**
 * Grocery grid tile. The add button becomes an inline stepper once the item is
 * in the basket, so quantities can be changed without leaving the aisle.
 */
function GroceryTileBase({
  product,
  quantityInBasket,
  onPress,
  onAdd,
  onChangeQuantity,
}: GroceryTileProps) {
  const handlePress = useCallback(() => onPress(product), [onPress, product]);
  const handleAdd = useCallback(() => onAdd(product), [onAdd, product]);
  const increment = useCallback(
    () => onChangeQuantity(product, quantityInBasket + 1),
    [onChangeQuantity, product, quantityInBasket],
  );
  const decrement = useCallback(
    () => onChangeQuantity(product, quantityInBasket - 1),
    [onChangeQuantity, product, quantityInBasket],
  );

  const isDiscounted = product.originalPrice !== undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatPrice(product.price)}`}
      onPress={handlePress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
      <View>
        <AppImage source={{ uri: product.imageUrl }} style={styles.image} />

        {isDiscounted ? <Badge label="Save" tone="solid" style={styles.save} /> : null}

        <View style={styles.control}>
          {quantityInBasket > 0 ? (
            <View style={styles.stepper}>
              <QuantityStepper
                compact
                quantity={quantityInBasket}
                onIncrement={increment}
                onDecrement={decrement}
              />
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Add ${product.name} to basket`}
              hitSlop={6}
              onPress={handleAdd}
              style={styles.add}>
              <Icon name="plus" size={18} color={colors.textInverse} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.body}>
        <AppText variant="captionStrong" numberOfLines={2}>
          {product.name}
        </AppText>

        <View style={styles.priceRow}>
          <AppText variant="price">{formatPrice(product.price)}</AppText>
          {isDiscounted ? (
            <AppText variant="priceSmall" color="textSubtle" style={styles.strike}>
              {formatPrice(product.originalPrice!)}
            </AppText>
          ) : null}
        </View>

        {product.unitPrice !== undefined && product.unitLabel ? (
          <AppText variant="priceSmall" color="textSubtle">
            {formatUnitPrice(product.unitPrice, product.unitLabel)}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, ...surfaces.card },
  image: {
    height: 132,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
  },
  save: { position: 'absolute', top: spacing.sm, left: spacing.sm },
  control: { position: 'absolute', right: spacing.sm, bottom: -spacing.md },
  add: {
    width: 38,
    height: 38,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepper: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  body: { padding: spacing.md, paddingTop: spacing.xl, gap: spacing.xxs },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  strike: { textDecorationLine: 'line-through' },
  pressed: { opacity: 0.92 },
});

export const GroceryTile = memo(
  GroceryTileBase,
  (prev, next) =>
    prev.product === next.product && prev.quantityInBasket === next.quantityInBasket,
);

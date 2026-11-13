import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppImage, AppText, GradientScrim } from '../../../components/ui';
import { colors, radii, SCREEN_GUTTER, shadows, spacing } from '../../../theme';
import { DISH_CATEGORIES, type DishCategory } from '../homeContent';

export type DishCategoriesProps = {
  onSelect: (dish: DishCategory) => void;
};

/** "Categories" — square photo tiles for browsing by dish. */
function DishCategoriesBase({ onSelect }: DishCategoriesProps) {
  return (
    <View style={styles.grid}>
      {DISH_CATEGORIES.map(dish => (
        <Pressable
          key={dish.name}
          accessibilityRole="button"
          accessibilityLabel={`${dish.name}, ${dish.count}`}
          onPress={() => onSelect(dish)}
          style={({ pressed }) => [styles.cell, pressed && styles.pressed]}>
          <View style={styles.card}>
            <AppImage source={{ uri: dish.imageUrl }} style={styles.art} />
            <GradientScrim from="bottom" intensity={0.85} />

            <View style={styles.caption}>
              <AppText variant="captionStrong" color="textInverse" numberOfLines={1}>
                {dish.name}
              </AppText>
              <AppText variant="label" color="textInverse" style={styles.count}>
                {dish.count}
              </AppText>
            </View>
          </View>
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
    rowGap: spacing.md,
  },
  cell: { width: '33.333%', paddingHorizontal: spacing.xs },
  card: {
    aspectRatio: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.primaryDark,
    ...shadows.subtle,
  },
  art: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  caption: { flex: 1, justifyContent: 'flex-end', padding: spacing.sm },
  count: { opacity: 0.75 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.97 }] },
});

export const DishCategories = memo(DishCategoriesBase);

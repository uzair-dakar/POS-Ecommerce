import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View, type ListRenderItem } from 'react-native';
import { AppImage, AppText } from '../../../components/ui';
import { HorizontalList } from '../../../components/layout';
import { colors, radii, shadows, spacing } from '../../../theme';
import type { Category } from '../../../types';
import { CATEGORY_ART, CATEGORY_TINT, DEFAULT_CATEGORY_TINT } from '../homeContent';

export const CATEGORY_TILE_WIDTH = 78;

export type CategoryRailProps = {
  categories: readonly Category[];
  selectedSlug?: string;
  onSelect: (category: Category) => void;
};

/** The big tiles at the top of the feed — "What are you looking for?". */
function CategoryRailBase({ categories, selectedSlug, onSelect }: CategoryRailProps) {
  const renderItem = useCallback<ListRenderItem<Category>>(
    ({ item }) => {
      const isSelected = item.slug === selectedSlug;
      const art = CATEGORY_ART[item.slug];
      const source = art ?? (item.imageUrl ? { uri: item.imageUrl } : undefined);

      return (
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: isSelected }}
          accessibilityLabel={item.name}
          onPress={() => onSelect(item)}
          style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
          <View style={styles.tileHost}>
            <View
              style={[
                styles.tile,
                { backgroundColor: CATEGORY_TINT[item.slug] ?? DEFAULT_CATEGORY_TINT },
                isSelected && styles.tileSelected,
              ]}>
              {source ? <AppImage source={source} style={styles.image} /> : null}
            </View>
          </View>

          <AppText
            variant="captionStrong"
            color={isSelected ? 'textAccent' : 'text'}
            align="center"
            numberOfLines={2}>
            {item.name}
          </AppText>
        </Pressable>
      );
    },
    [selectedSlug, onSelect],
  );

  return (
    <HorizontalList
      data={categories}
      renderItem={renderItem}
      keyExtractor={item => item.slug}
      itemWidth={CATEGORY_TILE_WIDTH}
      gap={spacing.sm + 2}
    />
  );
}

const styles = StyleSheet.create({
  item: { width: CATEGORY_TILE_WIDTH, gap: spacing.sm },
  // The tile clips its photo, and a clipping view cannot cast a shadow on
  // iOS — so the lift lives on a host view wrapped around it.
  tileHost: {
    width: CATEGORY_TILE_WIDTH,
    height: CATEGORY_TILE_WIDTH,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  tile: {
    width: CATEGORY_TILE_WIDTH,
    height: CATEGORY_TILE_WIDTH,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.transparent,
  },
  tileSelected: { borderColor: colors.accent },
  image: { flex: 1, backgroundColor: colors.transparent },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
});

export const CategoryRail = memo(CategoryRailBase);

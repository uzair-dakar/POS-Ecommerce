import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View, type ListRenderItem } from 'react-native';
import { AppImage, AppText } from '../../../components/ui';
import { HorizontalList } from '../../../components/layout';
import { colors, radii, shadows, spacing } from '../../../theme';
import type { Category, CategoryId } from '../../../types';

export const CATEGORY_TILE_WIDTH = 96;

/**
 * A soft wash behind each tile's art, cycled by position.
 *
 * The reference app gives every category its own pastel plate, which is what
 * stops a row of photographs reading as a grey grid. Cycling by index means a
 * new category from the server gets a colour without anyone assigning one.
 */
const TILE_TINTS = ['#FDF0DC', '#E7F3E9', '#E4F0F8', '#FBE7E7', '#F0EAF8'] as const;

export type CategoryRailProps = {
  categories: readonly Category[];
  selectedId?: CategoryId;
  onSelect: (id: CategoryId) => void;
};

/** The big tiles at the top of the feed. */
function CategoryRailBase({ categories, selectedId, onSelect }: CategoryRailProps) {
  const renderItem = useCallback<ListRenderItem<Category>>(
    ({ item, index }) => {
      const isSelected = item.id === selectedId;
      return (
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: isSelected }}
          accessibilityLabel={item.name}
          onPress={() => onSelect(item.id)}
          style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
          <View style={styles.tileHost}>
            <View
              style={[
                styles.tile,
                { backgroundColor: TILE_TINTS[index % TILE_TINTS.length] },
                isSelected && styles.tileSelected,
              ]}>
              <AppImage source={{ uri: item.imageUrl }} style={styles.image} />
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
    [selectedId, onSelect],
  );

  return (
    <HorizontalList
      data={categories}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      itemWidth={CATEGORY_TILE_WIDTH}
      gap={spacing.md}
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
  image: { flex: 1 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
});

export const CategoryRail = memo(CategoryRailBase);

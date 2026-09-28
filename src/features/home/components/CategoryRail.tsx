import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View, type ListRenderItem } from 'react-native';
import { AppImage, AppText } from '../../../components/ui';
import { HorizontalList } from '../../../components/layout';
import { colors, radii, spacing } from '../../../theme';
import type { Category, CategoryId } from '../../../types';

const ITEM_WIDTH = 64;

export type CategoryRailProps = {
  categories: readonly Category[];
  selectedId?: CategoryId;
  onSelect: (id: CategoryId) => void;
};

function CategoryRailBase({ categories, selectedId, onSelect }: CategoryRailProps) {
  const renderItem = useCallback<ListRenderItem<Category>>(
    ({ item }) => {
      const isSelected = item.id === selectedId;
      return (
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: isSelected }}
          onPress={() => onSelect(item.id)}
          style={styles.item}>
          <View style={[styles.imageWrapper, isSelected && styles.imageWrapperSelected]}>
            <AppImage source={{ uri: item.imageUrl }} style={styles.image} />
          </View>
          <AppText
            variant="label"
            color={isSelected ? 'textAccent' : 'textMuted'}
            numberOfLines={1}>
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
      itemWidth={ITEM_WIDTH}
      gap={spacing.lg}
    />
  );
}

const styles = StyleSheet.create({
  item: { width: ITEM_WIDTH, alignItems: 'center', gap: spacing.xs },
  imageWrapper: {
    width: 58,
    height: 58,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.transparent,
    padding: 2,
  },
  imageWrapperSelected: { borderColor: colors.accent },
  image: { flex: 1, borderRadius: radii.md },
});

export const CategoryRail = memo(CategoryRailBase);

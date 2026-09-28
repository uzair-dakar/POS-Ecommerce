import React, { useCallback } from 'react';
import { FlatList, StyleSheet, type ListRenderItem } from 'react-native';
import { SCREEN_GUTTER, spacing } from '../../theme';

export type HorizontalListProps<T> = {
  data: readonly T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  /** Pass when every card is the same width — enables getItemLayout. */
  itemWidth?: number;
  gap?: number;
};

/**
 * Horizontal carousel used by every "See all" row on the home feed.
 *
 * Generic so each row keeps its own item type end-to-end. When `itemWidth` is
 * known we supply getItemLayout, which lets FlatList skip on-the-fly
 * measurement — noticeably smoother on long brand/restaurant rows.
 */
export function HorizontalList<T>({
  data,
  renderItem,
  keyExtractor,
  itemWidth,
  gap = spacing.md,
}: HorizontalListProps<T>) {
  const getItemLayout = useCallback(
    (_: ArrayLike<T> | null | undefined, index: number) => ({
      length: itemWidth! + gap,
      offset: (itemWidth! + gap) * index,
      index,
    }),
    [itemWidth, gap],
  );

  return (
    <FlatList
      horizontal
      data={data as T[]}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.content, { gap }]}
      getItemLayout={itemWidth ? getItemLayout : undefined}
      initialNumToRender={4}
      maxToRenderPerBatch={4}
      windowSize={5}
      removeClippedSubviews
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SCREEN_GUTTER },
});

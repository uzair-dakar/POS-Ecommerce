import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { QueryBoundary, Screen } from '../../../components/layout';
import { AppText, IconButton, Skeleton } from '../../../components/ui';
import { useAppSelector } from '../../../store/hooks';
import { selectBasketQuantities } from '../../basket/basketSlice';
import { SCREEN_GUTTER, spacing } from '../../../theme';
import { pluralise } from '../../../utils';
import type { Product } from '../../../types';
import type { RootStackParamList } from '../../../navigation/types';
import { useGetMerchantQuery } from '../api/merchantsApi';
import { MenuItemRow } from '../components/MenuItemRow';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

/**
 * Every "Most ordered" dish at one merchant.
 *
 * The rail on the merchant page is a glance; this is the list. Same rows as
 * the menu itself, so an item looks and behaves identically wherever it is
 * met — a dish that changes shape between two screens reads as two dishes.
 */
export function PopularItemsScreen() {
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'PopularItems'>>();
  const quantities = useAppSelector(selectBasketQuantities);

  const query = useGetMerchantQuery(params.merchantId);

  const openProduct = useCallback(
    (product: Product) =>
      navigation.navigate('Product', {
        merchantId: params.merchantId,
        productId: product.id,
      }),
    [navigation, params.merchantId],
  );

  const renderItem = useCallback<ListRenderItem<Product>>(
    ({ item }) => (
      <MenuItemRow
        product={item}
        quantityInBasket={quantities[item.id] ?? 0}
        onPress={openProduct}
      />
    ),
    [quantities, openProduct],
  );

  return (
    <Screen edges={['top']}>
      <QueryBoundary {...query} skeleton={<PopularSkeleton />}>
        {detail => (
          <FlatList
            data={detail.popular}
            renderItem={renderItem}
            keyExtractor={product => product.id}
            contentContainerStyle={styles.content}
            ItemSeparatorComponent={Separator}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.header}>
                <IconButton
                  name="arrowLeft"
                  accessibilityLabel="Go back"
                  variant="outline"
                  size={40}
                  style={styles.back}
                  onPress={navigation.goBack}
                />
                <AppText variant="eyebrow" color="textAccent">
                  {detail.merchant.name}
                </AppText>
                <AppText variant="h1" style={styles.title}>
                  Most ordered
                </AppText>
                <AppText variant="body" color="textMuted">
                  What people here order the most.
                </AppText>
                <AppText variant="captionStrong" color="textMuted" style={styles.count}>
                  {pluralise(detail.popular.length, 'dish', 'dishes')}
                </AppText>
              </View>
            }
          />
        )}
      </QueryBoundary>
    </Screen>
  );
}

const Separator = () => <View style={styles.separator} />;

function PopularSkeleton() {
  return (
    <View style={styles.skeleton}>
      <Skeleton height={34} width="60%" />
      <Skeleton height={110} radius={14} />
      <Skeleton height={110} radius={14} />
      <Skeleton height={110} radius={14} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SCREEN_GUTTER, paddingBottom: spacing.huge },
  header: { paddingTop: spacing.sm, paddingBottom: spacing.md },
  back: { marginBottom: spacing.md },
  title: { marginTop: spacing.xxs, marginBottom: spacing.xs },
  count: { marginTop: spacing.lg },
  separator: { height: spacing.md },
  skeleton: { padding: SCREEN_GUTTER, gap: spacing.lg },
});

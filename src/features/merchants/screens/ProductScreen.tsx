import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QueryBoundary, Screen } from '../../../components/layout';
import {
  AppImage,
  AppText,
  Badge,
  Button,
  IconButton,
  QuantityStepper,
  Skeleton,
} from '../../../components/ui';
import { colors, radii, SCREEN_GUTTER, spacing } from '../../../theme';
import { formatPrice, formatUnitPrice } from '../../../utils';
import { useAppDispatch } from '../../../store/hooks';
import { lineAdded } from '../../basket/basketSlice';
import type { RootStackParamList } from '../../../navigation/types';
import { useGetMerchantQuery, useGetProductQuery } from '../api/merchantsApi';
import { OptionGroupBlock } from '../components/OptionGroupBlock';
import { useProductSelection } from '../hooks/useProductSelection';

/**
 * Product sheet, presented as a modal.
 *
 * Handles both shapes from the design: a configurable restaurant item with
 * option groups, and a grocery item that has none and instead shows its unit
 * facts. The difference is entirely data — an empty `optionGroups`.
 */
export function ProductScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Product'>>();
  const dispatch = useAppDispatch();

  const query = useGetProductQuery(params.productId);
  const { data: merchantDetail } = useGetMerchantQuery(params.merchantId);

  const groups = query.data?.optionGroups ?? [];
  const selection = useProductSelection(query.data?.product, groups);

  const addToBasket = useCallback(() => {
    const product = query.data?.product;
    if (!product || !merchantDetail) {
      return;
    }

    dispatch(
      lineAdded({
        merchantId: merchantDetail.merchant.id,
        merchantName: merchantDetail.merchant.name,
        merchantImageUrl: merchantDetail.merchant.imageUrl,
        line: {
          productId: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          unitPrice: selection.unitPrice,
          quantity: selection.quantity,
          optionsSummary: selection.optionsSummary,
        },
      }),
    );
    navigation.goBack();
  }, [query.data, merchantDetail, selection, dispatch, navigation]);

  return (
    <Screen edges={[]} background="surface">
      <QueryBoundary {...query} skeleton={<ProductSkeleton />} errorTitle="We couldn't load this item">
        {({ product, optionGroups }) => {
          const hasOptions = optionGroups.length > 0;
          const isDiscounted = product.originalPrice !== undefined;

          return (
            <>
              <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}>
                <View>
                  <AppImage source={{ uri: product.imageUrl }} style={styles.image} />
                  <View style={[styles.closeBar, { paddingTop: insets.top + spacing.sm }]}>
                    <IconButton
                      name="close"
                      accessibilityLabel="Close"
                      onPress={navigation.goBack}
                    />
                  </View>
                </View>

                <View style={styles.body}>
                  {product.isPopular ? <Badge label="Popular" tone="accent" /> : null}

                  <AppText variant="display">{product.name}</AppText>

                  <View style={styles.priceRow}>
                    <AppText variant="priceLarge">{formatPrice(product.price)}</AppText>
                    {isDiscounted ? (
                      <>
                        <AppText variant="price" color="textSubtle" style={styles.strike}>
                          {formatPrice(product.originalPrice!)}
                        </AppText>
                        <Badge
                          label={`Save ${formatPrice(product.originalPrice! - product.price)}`}
                          tone="success"
                        />
                      </>
                    ) : null}
                  </View>

                  <AppText variant="body" color="textMuted">
                    {product.description}
                  </AppText>
                </View>

                {hasOptions ? (
                  <View style={styles.groups}>
                    {optionGroups.map(group => (
                      <OptionGroupBlock
                        key={group.id}
                        group={group}
                        selectedIds={selection.selections[group.id] ?? []}
                        onToggle={selection.toggleOption}
                      />
                    ))}
                  </View>
                ) : (
                  <View style={styles.facts}>
                    {product.unitPrice !== undefined && product.unitLabel ? (
                      <Fact
                        label="Unit price"
                        value={formatUnitPrice(product.unitPrice, product.unitLabel)}
                      />
                    ) : null}
                    <Fact label="Size" value={product.name.split(', ').pop() ?? '—'} />
                    {merchantDetail ? (
                      <Fact label="Sold by" value={merchantDetail.merchant.name} last />
                    ) : null}
                  </View>
                )}
              </ScrollView>

              <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
                <QuantityStepper
                  quantity={selection.quantity}
                  min={1}
                  onIncrement={selection.increment}
                  onDecrement={selection.decrement}
                />
                <Button
                  label="Add to basket"
                  trailingLabel={formatPrice(selection.lineTotal)}
                  disabled={!selection.isValid}
                  style={styles.addButton}
                  onPress={addToBasket}
                />
              </View>
            </>
          );
        }}
      </QueryBoundary>
    </Screen>
  );
}

function Fact({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.fact, last && styles.factLast]}>
      <AppText variant="body" color="textMuted">
        {label}
      </AppText>
      <AppText variant="bodyStrong">{value}</AppText>
    </View>
  );
}

function ProductSkeleton() {
  return (
    <View style={styles.skeleton}>
      <Skeleton height={280} radius={0} />
      <View style={styles.skeletonBody}>
        <Skeleton height={30} width="70%" />
        <Skeleton height={22} width="35%" />
        <Skeleton height={60} />
        <Skeleton height={140} radius={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.huge * 2 },
  image: { height: 280 },
  closeBar: {
    ...StyleSheet.absoluteFill,
    alignItems: 'flex-end',
    paddingHorizontal: SCREEN_GUTTER,
  },

  body: { paddingHorizontal: SCREEN_GUTTER, paddingTop: spacing.xl, gap: spacing.sm },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  strike: { textDecorationLine: 'line-through' },

  groups: {
    marginTop: spacing.xl,
    paddingHorizontal: SCREEN_GUTTER,
    paddingTop: spacing.xl,
    gap: spacing.xxl,
    borderTopWidth: 8,
    borderTopColor: colors.surfaceMuted,
  },

  facts: {
    margin: SCREEN_GUTTER,
    marginTop: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  factLast: { borderBottomWidth: 0 },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: SCREEN_GUTTER,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
  },
  addButton: { flex: 1 },

  skeleton: { flex: 1 },
  skeletonBody: { padding: SCREEN_GUTTER, gap: spacing.lg },
});

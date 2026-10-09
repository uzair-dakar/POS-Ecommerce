import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View, type ListRenderItem } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { HorizontalList, QueryBoundary, Screen } from '../../../components/layout';
import {
  AppText,
  Icon,
  SearchBar,
  SectionHeader,
  SegmentedControl,
  Skeleton,
} from '../../../components/ui';
import { BasketBar } from '../../basket/components/BasketBar';
import { DeliveryTimeSheet } from '../../basket/components/DeliveryTimeSheet';
import {
  deliverySlotChosen,
  lineAdded,
  lineQuantityChanged,
  selectBasketQuantities,
  selectDeliverySlot,
} from '../../basket/basketSlice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { colors, SCREEN_GUTTER, spacing, surfaces } from '../../../theme';
import { formatDeliveryWindow, formatPrice } from '../../../utils';
import type { MerchantDetail, Product, SectionId } from '../../../types';
import type { RootStackParamList } from '../../../navigation/types';
import { useGetMerchantQuery } from '../api/merchantsApi';
import { MerchantHero } from '../components/MerchantHero';
import { MenuItemRow } from '../components/MenuItemRow';
import { GroceryTile } from '../components/GroceryTile';
import { OfferCard, OFFER_CARD_WIDTH } from '../components/OfferCard';
import { PopularCard, POPULAR_CARD_WIDTH } from '../components/PopularCard';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type Fulfilment = 'delivery' | 'pickup';

/**
 * One screen for both merchant kinds.
 *
 * Restaurants and markets share the hero, offers and section tabs; only the
 * product list differs — a single column of menu rows versus a two-column
 * grocery grid. Splitting them into two screens would duplicate everything
 * above the list.
 */
export function MerchantScreen() {
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Merchant'>>();
  const dispatch = useAppDispatch();
  const quantities = useAppSelector(selectBasketQuantities);

  const [activeSectionId, setActiveSectionId] = useState<SectionId>();
  const [whenOpen, setWhenOpen] = useState(false);

  const scheduledFor = useAppSelector(selectDeliverySlot);
  const [fulfilment, setFulfilment] = useState<Fulfilment>('delivery');

  const query = useGetMerchantQuery(params.merchantId);

  const openProduct = useCallback(
    (product: Product) =>
      navigation.navigate('Product', {
        merchantId: params.merchantId,
        productId: product.id,
      }),
    [navigation, params.merchantId],
  );

  const openBasket = useCallback(() => navigation.navigate('Basket'), [navigation]);

  const openPopular = useCallback(
    () => navigation.navigate('PopularItems', { merchantId: params.merchantId }),
    [navigation, params.merchantId],
  );

  /** Groceries have no options, so they go straight into the basket. */
  const addGrocery = useCallback(
    (detail: MerchantDetail, product: Product) => {
      dispatch(
        lineAdded({
          merchantId: detail.merchant.id,
          merchantName: detail.merchant.name,
          merchantImageUrl: detail.merchant.imageUrl,
          line: {
            productId: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            unitPrice: product.price,
            quantity: 1,
          },
        }),
      );
    },
    [dispatch],
  );

  const setGroceryQuantity = useCallback(
    (product: Product, quantity: number) => {
      dispatch(lineQuantityChanged({ productId: product.id, quantity }));
    },
    [dispatch],
  );

  return (
    <Screen edges={['top']}>
      <QueryBoundary {...query} skeleton={<MerchantSkeleton />} errorTitle="We couldn't load this store">
        {detail => {
          const isMarket = detail.merchant.kind === 'market';
          const sections = detail.sections;
          const activeSection =
            sections.find(section => section.id === activeSectionId) ?? sections[0];

          const renderMenuItem: ListRenderItem<Product> = ({ item }) => (
            <View style={styles.rowGutter}>
              <MenuItemRow
                product={item}
                quantityInBasket={quantities[item.id] ?? 0}
                onPress={openProduct}
              />
            </View>
          );

          const renderGrocery: ListRenderItem<Product> = ({ item }) => (
            <GroceryTile
              product={item}
              quantityInBasket={quantities[item.id] ?? 0}
              onPress={openProduct}
              onAdd={product => addGrocery(detail, product)}
              onChangeQuantity={setGroceryQuantity}
            />
          );

          return (
            <>
              <FlatList
                key={isMarket ? 'grid' : 'list'}
                data={activeSection?.products ?? []}
                renderItem={isMarket ? renderGrocery : renderMenuItem}
                keyExtractor={product => product.id}
                numColumns={isMarket ? 2 : 1}
                columnWrapperStyle={isMarket ? styles.gridRow : undefined}
                contentContainerStyle={styles.content}
                ItemSeparatorComponent={Separator}
                showsVerticalScrollIndicator={false}
                initialNumToRender={6}
                windowSize={7}
                removeClippedSubviews
                ListHeaderComponent={
                  <View>
                    <MerchantHero
                      detail={detail}
                      onSearch={isMarket ? () => navigation.navigate('Search') : undefined}
                    />

                    <View style={styles.header}>
                      {isMarket ? (
                        <>
                          <View style={styles.statStrip}>
                            <Stat
                              label="Delivery"
                              value={formatDeliveryWindow(
                                detail.merchant.deliveryMinMinutes,
                                detail.merchant.deliveryMaxMinutes,
                              )}
                            />
                            <Stat label="Min. order" value={formatPrice(detail.merchant.minOrder)} />
                            <Stat label="Rating" value={`★ ${detail.merchant.rating.toFixed(1)}`} />
                          </View>

                          <SearchBar
                            placeholder={`Search in ${detail.merchant.name}`}
                            onPress={() => navigation.navigate('Search')}
                          />
                        </>
                      ) : (
                        <>
                          <FulfilmentToggle
                            detail={detail}
                            value={fulfilment}
                            onChange={setFulfilment}
                          />

                          <View style={styles.whenRow}>
                            <Pill
                              icon="clock"
                              label="When?"
                              value={scheduledFor?.label ?? 'Standard'}
                              trailing="chevronDown"
                              onPress={() => setWhenOpen(true)}
                            />
                            {detail.acceptsReservations ? (
                              <Pill
                                icon="calendar"
                                label=""
                                value="Book table"
                                trailing="chevronRight"
                                onPress={() =>
                                  navigation.navigate('ReservationDateTime', {
                                    merchantId: detail.merchant.id,
                                  })
                                }
                              />
                            ) : null}
                          </View>
                        </>
                      )}
                    </View>

                    {detail.offers.length > 0 ? (
                      <View style={styles.offers}>
                        <AppText variant="h2" style={styles.offersTitle}>
                          Deals &amp; benefits
                        </AppText>
                        <HorizontalList
                          data={detail.offers}
                          keyExtractor={offer => offer.id}
                          itemWidth={OFFER_CARD_WIDTH}
                          renderItem={({ item }) => <OfferCard offer={item} />}
                        />
                      </View>
                    ) : null}

                    {detail.popular.length > 0 ? (
                      <View style={styles.popular}>
                        <SectionHeader
                          title="Most ordered"
                          actionLabel="See all"
                          onActionPress={openPopular}
                        />
                        <HorizontalList
                          data={detail.popular}
                          keyExtractor={product => product.id}
                          itemWidth={POPULAR_CARD_WIDTH}
                          renderItem={({ item }) => (
                            <PopularCard
                              product={item}
                              quantityInBasket={quantities[item.id] ?? 0}
                              onPress={openProduct}
                              onAdd={product => addGrocery(detail, product)}
                            />
                          )}
                        />
                      </View>
                    ) : null}

                    <View style={styles.tabs}>
                      <SegmentedControl
                        options={sections.map(section => section.id)}
                        value={activeSection?.id ?? sections[0]?.id}
                        onChange={setActiveSectionId}
                        getLabel={(id: string) =>
                          sections.find(section => section.id === id)?.name ?? id
                        }
                        accessibilityLabel="Menu sections"
                      />
                    </View>

                    <AppText variant="h2" style={styles.sectionTitle}>
                      {activeSection?.name}
                    </AppText>
                  </View>
                }
              />

              <BasketBar onPress={openBasket} />

              <DeliveryTimeSheet
                visible={whenOpen}
                standardLabel={formatDeliveryWindow(
                  detail.merchant.deliveryMinMinutes,
                  detail.merchant.deliveryMaxMinutes,
                )}
                value={scheduledFor}
                onChange={slot => dispatch(deliverySlotChosen(slot))}
                onClose={() => setWhenOpen(false)}
              />
            </>
          );
        }}
      </QueryBoundary>
    </Screen>
  );
}

const Separator = () => <View style={styles.separator} />;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
      <AppText variant="captionStrong">{value}</AppText>
    </View>
  );
}

function FulfilmentToggle({
  detail,
  value,
  onChange,
}: {
  detail: MerchantDetail;
  value: Fulfilment;
  onChange: (next: Fulfilment) => void;
}) {
  return (
    <View style={styles.toggle}>
      <ToggleOption
        selected={value === 'delivery'}
        icon="bike"
        title="Delivery"
        subtitle={`${formatDeliveryWindow(
          detail.merchant.deliveryMinMinutes,
          detail.merchant.deliveryMaxMinutes,
        )} · ${formatPrice(detail.merchant.deliveryFee)}`}
        onPress={() => onChange('delivery')}
      />
      {detail.supportsPickup ? (
        <ToggleOption
          selected={value === 'pickup'}
          icon="pin"
          title="Pickup"
          subtitle={formatDeliveryWindow(detail.pickupMinMinutes, detail.pickupMaxMinutes)}
          onPress={() => onChange('pickup')}
        />
      ) : null}
    </View>
  );
}

function ToggleOption({
  selected,
  icon,
  title,
  subtitle,
  onPress,
}: {
  selected: boolean;
  icon: 'bike' | 'pin';
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.toggleOption, selected && styles.toggleOptionSelected]}>
      <Icon name={icon} size={18} color={selected ? colors.textInverse : colors.text} />
      <View style={styles.toggleCopy}>
        <AppText variant="captionStrong" color={selected ? 'textInverse' : 'text'}>
          {title}
        </AppText>
        <AppText variant="caption" color={selected ? 'textInverse' : 'textMuted'}>
          {subtitle}
        </AppText>
      </View>
    </Pressable>
  );
}

function Pill({
  icon,
  label,
  value,
  trailing,
  onPress,
}: {
  icon: 'clock' | 'calendar';
  label: string;
  value: string;
  trailing: 'chevronDown' | 'chevronRight';
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={styles.pill}>
      <Icon name={icon} size={17} color={colors.accentPressed} />
      <View style={styles.pillCopy}>
        {label ? (
          <AppText variant="label" color="textMuted">
            {label}
          </AppText>
        ) : null}
        <AppText variant="captionStrong">{value}</AppText>
      </View>
      <Icon name={trailing} size={13} color={colors.textMuted} />
    </Pressable>
  );
}

function MerchantSkeleton() {
  return (
    <View style={styles.skeleton}>
      <Skeleton height={220} radius={0} />
      <View style={styles.skeletonBody}>
        <Skeleton height={26} width="60%" />
        <Skeleton height={64} radius={14} />
        <Skeleton height={96} radius={14} />
        <Skeleton height={116} radius={14} />
        <Skeleton height={116} radius={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 120 },
  rowGutter: { paddingHorizontal: SCREEN_GUTTER },
  gridRow: { paddingHorizontal: SCREEN_GUTTER, gap: spacing.md },
  separator: { height: spacing.md },

  header: { paddingHorizontal: SCREEN_GUTTER, paddingBottom: spacing.lg, gap: spacing.md },
  statStrip: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    ...surfaces.card,
  },
  stat: { flex: 1, alignItems: 'center', gap: spacing.xxs },

  toggle: { flexDirection: 'row', gap: spacing.md },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    ...surfaces.card,
  },
  toggleOptionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleCopy: { flex: 1, gap: spacing.xxs },

  whenRow: { flexDirection: 'row', gap: spacing.md },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    ...surfaces.card,
  },
  pillCopy: { flex: 1 },

  offers: { paddingBottom: spacing.lg, gap: spacing.md },
  offersTitle: { paddingHorizontal: SCREEN_GUTTER },

  popular: { paddingBottom: spacing.lg },
  tabs: { paddingHorizontal: SCREEN_GUTTER, paddingBottom: spacing.lg },
  sectionTitle: { paddingHorizontal: SCREEN_GUTTER, paddingBottom: spacing.md },

  skeleton: { flex: 1 },
  skeletonBody: { padding: SCREEN_GUTTER, gap: spacing.lg },
});

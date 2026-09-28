import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
  type ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen, HorizontalList } from '../../../components/layout';
import { AppText, Button, SectionHeader, Skeleton } from '../../../components/ui';
import { BasketBar } from '../../basket/components/BasketBar';
import { colors, SCREEN_GUTTER, spacing } from '../../../theme';
import type { CategoryId, Chain, Merchant, Promotion } from '../../../types';
import type { RootStackParamList } from '../../../navigation/types';

import { useGetHomeFeedQuery } from '../api/homeApi';
import { CategoryRail } from '../components/CategoryRail';
import { HomeHeader } from '../components/HomeHeader';
import { HeroPromoCard } from '../components/HeroPromoCard';
import { QuickPromoCard } from '../components/QuickPromoCard';
import { BrandCard, BRAND_CARD_WIDTH } from '../components/BrandCard';
import { MerchantCard, MERCHANT_CARD_WIDTH } from '../components/MerchantCard';

/**
 * Each row of the feed is one item in a single virtualized list. Building the
 * screen this way — rather than a ScrollView of everything — means off-screen
 * sections are never mounted, so the feed stays cheap however long it grows.
 */
type Section =
  | { key: 'categories' }
  | { key: 'hero' }
  | { key: 'quickPromos' }
  | { key: 'brands' }
  | { key: 'popular' }
  | { key: 'fastest' }
  | { key: 'markets' };

type Navigation = NativeStackNavigationProp<RootStackParamList>;

/** Floating tab bar height — the feed and basket bar both clear it. */
const TAB_BAR_CLEARANCE = 78;

export function HomeScreen() {
  const navigation = useNavigation<Navigation>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>();

  const { data: feed, isLoading, isFetching, isError, refetch } = useGetHomeFeedQuery();

  /** refetch() resolves to a query result; callers only need a void handler. */
  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  /* ---------------------------- interactions ---------------------------- */

  const openMerchant = useCallback(
    (merchant: Merchant) => navigation.navigate('Merchant', { merchantId: merchant.id }),
    [navigation],
  );

  const openChain = useCallback(
    (chain: Chain) => navigation.navigate('Chain', { chainId: chain.id }),
    [navigation],
  );

  const openPromotion = useCallback(
    (promotion: Promotion) => {
      if (promotion.target.type === 'merchant') {
        navigation.navigate('Merchant', { merchantId: promotion.target.id });
      } else {
        setSelectedCategory(promotion.target.id);
      }
    },
    [navigation],
  );

  const openBasket = useCallback(() => navigation.navigate('Basket'), [navigation]);
  const openSearch = useCallback(() => navigation.navigate('Search'), [navigation]);
  const openAddressPicker = useCallback(() => navigation.navigate('Addresses'), [navigation]);

  /* ------------------------------ rendering ----------------------------- */

  const sections = useMemo<Section[]>(
    () => [
      { key: 'categories' },
      { key: 'hero' },
      { key: 'quickPromos' },
      { key: 'brands' },
      { key: 'popular' },
      { key: 'fastest' },
      { key: 'markets' },
    ],
    [],
  );

  const renderMerchantRow = useCallback<ListRenderItem<Merchant>>(
    ({ item }) => <MerchantCard merchant={item} onPress={openMerchant} onToggleFavourite={() => {}} />,
    [openMerchant],
  );

  const renderSection = useCallback<ListRenderItem<Section>>(
    ({ item }) => {
      if (!feed) {
        return null;
      }

      switch (item.key) {
        case 'categories':
          return (
            <CategoryRail
              categories={feed.categories}
              selectedId={selectedCategory}
              onSelect={setSelectedCategory}
            />
          );

        case 'hero':
          return (
            <View style={styles.gutter}>
              {feed.heroPromotions.map(promotion => (
                <HeroPromoCard
                  key={promotion.id}
                  promotion={promotion}
                  width={width - SCREEN_GUTTER * 2}
                  onPress={openPromotion}
                />
              ))}
            </View>
          );

        case 'quickPromos':
          return (
            <View style={[styles.gutter, styles.quickPromoRow]}>
              {feed.quickPromotions.map((promotion, index) => (
                <QuickPromoCard
                  key={promotion.id}
                  promotion={promotion}
                  tone={index === 0 ? 'accent' : 'surface'}
                  onPress={openPromotion}
                />
              ))}
            </View>
          );

        case 'brands':
          return (
            <>
              <SectionHeader
                eyebrow="Curated for you"
                title="Brands you love"
                actionLabel="See all"
                onActionPress={() => navigation.navigate('Chains')}
              />
              <HorizontalList
                data={feed.brands}
                keyExtractor={chain => chain.id}
                itemWidth={BRAND_CARD_WIDTH}
                renderItem={({ item: chain }) => <BrandCard chain={chain} onPress={openChain} />}
              />
            </>
          );

        case 'popular':
          return (
            <>
              <SectionHeader
                title="Popular restaurants"
                actionLabel="See all"
                onActionPress={() => navigation.navigate('MerchantList', { kind: 'restaurant' })}
              />
              <HorizontalList
                data={feed.popularRestaurants}
                keyExtractor={merchant => merchant.id}
                itemWidth={MERCHANT_CARD_WIDTH}
                renderItem={renderMerchantRow}
              />
            </>
          );

        case 'fastest':
          return (
            <>
              <SectionHeader
                title="Fastest delivery"
                actionLabel="See all"
                onActionPress={() => navigation.navigate('MerchantList', { kind: 'restaurant' })}
              />
              <HorizontalList
                data={feed.fastestDelivery}
                keyExtractor={merchant => merchant.id}
                itemWidth={MERCHANT_CARD_WIDTH}
                renderItem={renderMerchantRow}
              />
            </>
          );

        case 'markets':
          return (
            <>
              <SectionHeader
                title="Fill your basket"
                actionLabel="See all"
                onActionPress={() => navigation.navigate('MerchantList', { kind: 'market' })}
              />
              <HorizontalList
                data={feed.markets}
                keyExtractor={merchant => merchant.id}
                itemWidth={MERCHANT_CARD_WIDTH}
                renderItem={renderMerchantRow}
              />
            </>
          );
      }
    },
    [feed, selectedCategory, width, openPromotion, openChain, renderMerchantRow, navigation],
  );

  if (isError) {
    return (
      <Screen gutter>
        <View style={styles.centered}>
          <AppText variant="h2" align="center">
            We couldn't load your feed
          </AppText>
          <AppText variant="body" color="textMuted" align="center">
            Check your connection and try again.
          </AppText>
          <Button label="Try again" fullWidth={false} onPress={handleRefresh} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={isLoading ? [] : sections}
        renderItem={renderSection}
        keyExtractor={section => section.key}
        ListHeaderComponent={
          <HomeHeader
            deliverTo={feed?.deliverTo ?? '—'}
            onChangeAddress={openAddressPicker}
            onSearchPress={openSearch}
          />
        }
        ListEmptyComponent={isLoading ? HomeFeedSkeleton : undefined}
        ItemSeparatorComponent={SectionSeparator}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: TAB_BAR_CLEARANCE + insets.bottom + spacing.huge },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
        initialNumToRender={3}
        maxToRenderPerBatch={2}
        windowSize={7}
        removeClippedSubviews
      />

      <BasketBar onPress={openBasket} bottomOffset={TAB_BAR_CLEARANCE + insets.bottom} />
    </Screen>
  );
}

const SectionSeparator = () => <View style={styles.separator} />;

/** Mirrors the real layout so the feed doesn't jump when data arrives. */
function HomeFeedSkeleton() {
  return (
    <View style={[styles.gutter, styles.skeleton]}>
      <Skeleton height={64} radius={14} />
      <Skeleton height={190} radius={20} />
      <View style={styles.quickPromoRow}>
        <Skeleton height={148} radius={14} style={styles.flex} />
        <Skeleton height={148} radius={14} style={styles.flex} />
      </View>
      <Skeleton height={24} width="55%" />
      <Skeleton height={210} radius={14} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.xs },
  gutter: { paddingHorizontal: SCREEN_GUTTER },
  quickPromoRow: { flexDirection: 'row', gap: spacing.md },
  separator: { height: spacing.xxl },
  skeleton: { gap: spacing.lg, paddingTop: spacing.lg },
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
});

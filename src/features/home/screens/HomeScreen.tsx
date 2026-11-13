import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  type ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen, HorizontalList } from '../../../components/layout';
import { AppText, Button, SectionHeader, Skeleton } from '../../../components/ui';
import { colors, SCREEN_GUTTER, spacing } from '../../../theme';
import type { Category, CategoryId, Chain, Merchant, Promotion } from '../../../types';
import type { RootStackParamList } from '../../../navigation/types';
import { useTabBarMetrics } from '../../../navigation/tabBarMetrics';

import { useGetHomeFeedQuery } from '../api/homeApi';
import { CategoryRail } from '../components/CategoryRail';
import { HomeHeader } from '../components/HomeHeader';
import { HeroCarousel } from '../components/HeroCarousel';
import { QuickPromoCard } from '../components/QuickPromoCard';
import { FeatureStrip } from '../components/FeatureStrip';
import { EssentialsGrid } from '../components/EssentialsGrid';
import { DishCategories } from '../components/DishCategories';
import { FinalCta } from '../components/FinalCta';
import { BrandCard, BRAND_CARD_WIDTH } from '../components/BrandCard';
import { MerchantCard, MERCHANT_CARD_WIDTH } from '../components/MerchantCard';
import { StickyCategoryHeader } from '../components/StickyCategoryHeader';
import type { EssentialTile } from '../homeContent';

/**
 * Each row of the feed is one item in a single virtualized list. Building the
 * screen this way — rather than a ScrollView of everything — means off-screen
 * sections are never mounted, so the feed stays cheap however long it grows.
 *
 * The order is the web storefront's, so a shopper who knows one client can
 * find a row by where it sits in the other.
 */
type Section =
  | { key: 'categories' }
  | { key: 'hero' }
  | { key: 'quickPromos' }
  | { key: 'features' }
  | { key: 'brands' }
  | { key: 'essentials' }
  | { key: 'popular' }
  | { key: 'fastest' }
  | { key: 'dishes' }
  | { key: 'dinner' }
  | { key: 'offers' }
  | { key: 'markets' }
  | { key: 'finalCta' };

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList as new () => FlatList<Section>,
);

export function HomeScreen() {
  const navigation = useNavigation<Navigation>();
  const { clearance } = useTabBarMetrics();

  // Kept on the UI thread so the sticky bar tracks the finger even while the
  // feed is busy rendering rows.
  const scrollY = useSharedValue(0);
  const handleScroll = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });
  const [selectedSlug, setSelectedSlug] = useState<string>();

  const { data: feed, isLoading, isFetching, isError, refetch } = useGetHomeFeedQuery();

  /** refetch() resolves to a query result; callers only need a void handler. */
  const handleRefresh = useCallback(() => {
    refetch();
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

  /**
   * Each tile carries the kind its merchants are browsed as, so the feed —
   * not this screen — decides whether a category opens menus or a product
   * grid. The id goes along so the list can ask the server for that category.
   */
  const openCategory = useCallback(
    (category: Category) => {
      setSelectedSlug(category.slug);
      navigation.navigate('MerchantList', { kind: category.kind, categoryId: category.id });
    },
    [navigation],
  );

  /** The Essentials tiles are shops, so they open the market list. */
  const openEssential = useCallback(
    (tile: EssentialTile) =>
      navigation.navigate('MerchantList', {
        kind: 'market',
        categoryId: String(tile.businessTypeID) as CategoryId,
      }),
    [navigation],
  );

  const openRestaurants = useCallback(
    () => navigation.navigate('MerchantList', { kind: 'restaurant' }),
    [navigation],
  );

  const openMarkets = useCallback(
    () => navigation.navigate('MerchantList', { kind: 'market' }),
    [navigation],
  );

  const openPromotion = useCallback(
    (promotion: Promotion) => {
      if (promotion.target.type === 'merchant') {
        navigation.navigate('Merchant', { merchantId: promotion.target.id });
        return;
      }

      const category = feed?.categories.find(
        candidate => candidate.id === promotion.target.id,
      );
      navigation.navigate('MerchantList', {
        kind: category?.kind ?? 'market',
        categoryId: promotion.target.id,
      });
    },
    [feed, navigation],
  );

  const openSearch = useCallback(() => navigation.navigate('Search'), [navigation]);
  const openAddressPicker = useCallback(() => navigation.navigate('Addresses'), [navigation]);

  /* ------------------------------ rendering ----------------------------- */

  const sections = useMemo<Section[]>(
    () => [
      { key: 'categories' },
      { key: 'hero' },
      { key: 'quickPromos' },
      { key: 'features' },
      { key: 'brands' },
      { key: 'essentials' },
      { key: 'popular' },
      { key: 'fastest' },
      { key: 'dishes' },
      { key: 'dinner' },
      { key: 'offers' },
      { key: 'markets' },
      { key: 'finalCta' },
    ],
    [],
  );

  const renderMerchantRow = useCallback<ListRenderItem<Merchant>>(
    ({ item }) => <MerchantCard merchant={item} onPress={openMerchant} onToggleFavourite={() => {}} />,
    [openMerchant],
  );

  /** The four restaurant rows differ only in their heading and their data. */
  const merchantRow = useCallback(
    (
      eyebrow: string | undefined,
      title: string,
      data: readonly Merchant[],
      onSeeAll: () => void,
    ) => (
      <>
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          actionLabel="See all"
          onActionPress={onSeeAll}
        />
        <HorizontalList
          data={data}
          keyExtractor={merchant => merchant.id}
          itemWidth={MERCHANT_CARD_WIDTH}
          renderItem={renderMerchantRow}
        />
      </>
    ),
    [renderMerchantRow],
  );

  const renderSection = useCallback<ListRenderItem<Section>>(
    ({ item }) => {
      if (!feed) {
        return null;
      }

      switch (item.key) {
        case 'categories':
          return (
            <>
              <SectionHeader title="What are you looking for?" />
              <CategoryRail
                categories={feed.categories}
                selectedSlug={selectedSlug}
                onSelect={openCategory}
              />
            </>
          );

        case 'hero':
          return <HeroCarousel promotions={feed.heroPromotions} onPress={openPromotion} />;

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

        case 'features':
          return <FeatureStrip />;

        case 'brands':
          return (
            <>
              <SectionHeader
                eyebrow="Curated for you"
                title="Brands you love"
                subtitle="The names you already know, delivered locally."
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

        case 'essentials':
          return (
            <>
              <SectionHeader title="Essentials" />
              <EssentialsGrid onSelect={openEssential} />
            </>
          );

        case 'popular':
          return merchantRow(
            'Table for one, two, or the whole crew',
            'Popular near you',
            feed.popularRestaurants,
            openRestaurants,
          );

        case 'fastest':
          return merchantRow(
            'On your table in no time',
            'Fastest delivery',
            feed.fastestDelivery,
            openRestaurants,
          );

        case 'dishes':
          return (
            <>
              <SectionHeader title="Categories" />
              <DishCategories onSelect={openRestaurants} />
            </>
          );

        case 'dinner':
          return merchantRow(
            "Tonight's table, sorted",
            'Dinner near you',
            feed.dinner,
            openRestaurants,
          );

        case 'offers':
          return merchantRow(
            'Good food, better price',
            'Offers near you',
            feed.offers,
            openRestaurants,
          );

        case 'markets':
          return merchantRow(undefined, 'Fill your basket', feed.markets, openMarkets);

        case 'finalCta':
          return <FinalCta onPress={openMarkets} />;
      }
    },
    [
      feed,
      selectedSlug,
      openCategory,
      openEssential,
      openPromotion,
      openChain,
      openRestaurants,
      openMarkets,
      merchantRow,
      navigation,
    ],
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
      <AnimatedFlatList
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
          { paddingBottom: clearance + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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

      {feed ? (
        <StickyCategoryHeader
          scrollY={scrollY}
          categories={feed.categories}
          deliverTo={feed.deliverTo}
          selectedSlug={selectedSlug}
          onSelect={openCategory}
          onChangeAddress={openAddressPicker}
        />
      ) : null}

    </Screen>
  );
}

const SectionSeparator = () => <View style={styles.separator} />;

/** Mirrors the real layout so the feed doesn't jump when data arrives. */
function HomeFeedSkeleton() {
  return (
    <View style={[styles.gutter, styles.skeleton]}>
      <Skeleton height={64} radius={14} />
      <Skeleton height={216} radius={20} />
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

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
import type { CategoryId, Chain, Merchant, Promotion } from '../../../types';
import type { RootStackParamList } from '../../../navigation/types';
import { useTabBarMetrics } from '../../../navigation/tabBarMetrics';

import { useGetHomeFeedQuery } from '../api/homeApi';
import { CategoryRail } from '../components/CategoryRail';
import { HomeHeader } from '../components/HomeHeader';
import { HeroCarousel } from '../components/HeroCarousel';
import { QuickPromoCard } from '../components/QuickPromoCard';
import { BrandCard, BRAND_CARD_WIDTH } from '../components/BrandCard';
import { MerchantCard, MERCHANT_CARD_WIDTH } from '../components/MerchantCard';
import { StickyCategoryHeader } from '../components/StickyCategoryHeader';

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
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>();

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

  /** Categories map onto the two merchant kinds the app can list today. */
  const openCategory = useCallback(
    (id: CategoryId) => {
      setSelectedCategory(id);
      navigation.navigate('MerchantList', {
        kind: id === ('c_restaurants' as CategoryId) ? 'restaurant' : 'market',
      });
    },
    [navigation],
  );

  const openPromotion = useCallback(
    (promotion: Promotion) => {
      if (promotion.target.type === 'merchant') {
        navigation.navigate('Merchant', { merchantId: promotion.target.id });
      } else {
        openCategory(promotion.target.id);
      }
    },
    [navigation, openCategory],
  );

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
              onSelect={openCategory}
            />
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
    [feed, selectedCategory, openCategory, openPromotion, openChain, renderMerchantRow, navigation],
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
          selectedId={selectedCategory}
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

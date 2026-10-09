import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { QueryBoundary, Screen } from '../../../components/layout';
import {
  AppText,
  IconButton,
  SearchBar,
  SegmentedControl,
  Skeleton,
} from '../../../components/ui';
import { SCREEN_GUTTER, spacing } from '../../../theme';
import { pluralise } from '../../../utils';
import { useTabBarMetrics } from '../../../navigation/tabBarMetrics';
import type { Merchant, MerchantKind } from '../../../types';
import type { RootStackParamList } from '../../../navigation/types';
import { useGetMerchantsQuery } from '../api/merchantsApi';
import { MerchantCard } from '../../home/components/MerchantCard';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const FILTERS = ['All', 'Open now', 'Free delivery', 'Top rated'] as const;
type Filter = (typeof FILTERS)[number];

const COPY: Record<
  MerchantKind,
  { eyebrow: string; title: string; subtitle: string; noun: string }
> = {
  market: {
    eyebrow: 'Discover nearby',
    title: 'All markets',
    subtitle: 'Groceries from shops near you.',
    noun: 'market',
  },
  restaurant: {
    eyebrow: 'Discover nearby',
    title: 'All restaurants',
    subtitle: 'Local kitchens and favourites.',
    noun: 'restaurant',
  },
};

export type MerchantListScreenProps = {
  /** Supplied when mounted as a tab, which carries no route params. */
  kind?: MerchantKind;
};

/** Browse every merchant of one kind. Reached from a "See all" or the tab. */
export function MerchantListScreen({ kind: kindProp }: MerchantListScreenProps = {}) {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<RouteProp<RootStackParamList, 'MerchantList'>>();
  const [filter, setFilter] = useState<Filter>('All');
  const { clearance } = useTabBarMetrics();

  // Mounted as a tab it has no back button and must clear the tab bar;
  // pushed onto the stack it needs the reverse of both.
  const isTab = kindProp !== undefined;
  const kind = kindProp ?? route.params?.kind ?? 'restaurant';
  const query = useGetMerchantsQuery({ kind });
  const copy = COPY[kind];

  const openMerchant = useCallback(
    (merchant: Merchant) => navigation.navigate('Merchant', { merchantId: merchant.id }),
    [navigation],
  );

  const renderMerchant = useCallback<ListRenderItem<Merchant>>(
    ({ item }) => (
      <View style={styles.rowGutter}>
        <MerchantCard merchant={item} layout="wide" onPress={openMerchant} />
      </View>
    ),
    [openMerchant],
  );

  return (
    <Screen edges={['top']}>
      <QueryBoundary {...query} skeleton={<ListSkeleton />}>
        {merchants => {
          const visible = merchants.filter(merchant => {
            switch (filter) {
              case 'Open now':
                return merchant.isOpen;
              case 'Free delivery':
                return merchant.deliveryFee === 0;
              case 'Top rated':
                return merchant.rating >= 9;
              default:
                return true;
            }
          });

          return (
            <FlatList
              data={visible}
              renderItem={renderMerchant}
              keyExtractor={merchant => merchant.id}
              contentContainerStyle={[
                styles.content,
                isTab ? { paddingBottom: clearance + spacing.xxl } : null,
              ]}
              ItemSeparatorComponent={Separator}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View style={styles.header}>
                  {isTab ? null : (
                    <IconButton
                      name="arrowLeft"
                      accessibilityLabel="Go back"
                      variant="outline"
                      size={40}
                      style={styles.back}
                      onPress={navigation.goBack}
                    />
                  )}
                  <AppText variant="eyebrow" color="textAccent">
                    {copy.eyebrow}
                  </AppText>
                  <AppText variant="h1" style={styles.title}>
                    {copy.title}
                  </AppText>
                  <AppText variant="body" color="textMuted">
                    {copy.subtitle}
                  </AppText>

                  <SearchBar
                    placeholder={`Search ${copy.title.toLowerCase()}`}
                    onPress={() => navigation.navigate('Search')}
                    style={styles.search}
                  />

                  {/* Bled out to the screen edges so the track can run past
                      the gutter rather than wrapping onto a second line and
                      pushing the merchants down. */}
                  <View style={styles.filters}>
                    <SegmentedControl
                      options={FILTERS}
                      value={filter}
                      onChange={setFilter}
                      accessibilityLabel="Filter merchants"
                    />
                  </View>

                  <AppText variant="captionStrong" color="textMuted" style={styles.count}>
                    {pluralise(visible.length, copy.noun)} nearby
                  </AppText>
                </View>
              }
            />
          );
        }}
      </QueryBoundary>
    </Screen>
  );
}

const Separator = () => <View style={styles.separator} />;

function ListSkeleton() {
  return (
    <View style={styles.skeletonBody}>
      <Skeleton height={34} width="60%" />
      <Skeleton height={46} radius={10} />
      <Skeleton height={38} width="80%" radius={999} />
      <Skeleton height={250} radius={14} />
      <Skeleton height={250} radius={14} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.huge },
  header: {
    paddingHorizontal: SCREEN_GUTTER,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: { marginTop: spacing.xxs, marginBottom: spacing.xs },
  back: { marginBottom: spacing.sm },
  search: { marginTop: spacing.lg },
  filters: { marginTop: spacing.md },
  count: { marginTop: spacing.lg },
  rowGutter: { paddingHorizontal: SCREEN_GUTTER },
  separator: { height: spacing.lg },
  skeletonBody: { padding: SCREEN_GUTTER, gap: spacing.lg },
});

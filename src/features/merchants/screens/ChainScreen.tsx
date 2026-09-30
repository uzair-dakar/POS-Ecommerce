import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View, type ListRenderItem } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { QueryBoundary, Screen } from '../../../components/layout';
import { AppImage, AppText, Chip, Dot, IconButton, Skeleton } from '../../../components/ui';
import { colors, radii, SCREEN_GUTTER, spacing } from '../../../theme';
import type { ChainLocation } from '../../../types';
import type { RootStackParamList } from '../../../navigation/types';
import { useGetChainQuery } from '../api/merchantsApi';
import { LocationRow } from '../components/LocationRow';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

/** Filters the design offers above the locations list. */
const FILTERS = ['All', 'Open now', 'Fastest', 'Free delivery'] as const;
type Filter = (typeof FILTERS)[number];

export function ChainScreen() {
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'Chain'>>();
  const [filter, setFilter] = useState<Filter>('All');

  const query = useGetChainQuery(params.chainId);

  const openLocation = useCallback(
    (location: ChainLocation) =>
      navigation.navigate('Merchant', { merchantId: location.merchant.id }),
    [navigation],
  );

  // The hero is full-bleed, so the gutter lives on the rows rather than on the
  // list's content container.
  const renderLocation = useCallback<ListRenderItem<ChainLocation>>(
    ({ item }) => (
      <View style={styles.rowGutter}>
        <LocationRow location={item} onPress={openLocation} />
      </View>
    ),
    [openLocation],
  );

  return (
    <Screen edges={['top']} background="background">
      <QueryBoundary {...query} skeleton={<ChainSkeleton />} errorTitle="We couldn't load this brand">
        {detail => {
          // Filtering here rather than in the list keeps the row component
          // pure and the predicate in one readable place.
          const locations = detail.locations.filter(({ merchant }) => {
            switch (filter) {
              case 'Open now':
                return merchant.isOpen;
              case 'Fastest':
                return merchant.deliveryMaxMinutes <= 30;
              case 'Free delivery':
                return merchant.deliveryFee === 0;
              default:
                return true;
            }
          });

          const openCount = detail.locations.filter(l => l.merchant.isOpen).length;
          const fastest = Math.min(...detail.locations.map(l => l.merchant.deliveryMinMinutes));

          return (
            <FlatList
              data={locations}
              renderItem={renderLocation}
              keyExtractor={item => item.merchant.id}
              contentContainerStyle={styles.content}
              ItemSeparatorComponent={Separator}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View>
                  <View style={styles.hero}>
                    <AppImage source={{ uri: detail.heroImageUrl }} style={styles.heroImage} />
                    <View style={styles.heroScrim} />

                    <View style={styles.heroBar}>
                      <IconButton
                        name="arrowLeft"
                        accessibilityLabel="Go back"
                        onPress={navigation.goBack}
                      />
                      <IconButton
                        name="heart"
                        accessibilityLabel="Add to favourites"
                        onPress={() => {}}
                      />
                    </View>

                    <View style={styles.heroCopy}>
                      <View style={styles.localRow}>
                        <Dot />
                        <AppText variant="eyebrow" color="textInverse">
                          Local favourite
                        </AppText>
                      </View>
                      <AppText variant="display" color="textInverse">
                        {detail.chain.name}
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.body}>
                    <AppText variant="body" color="textMuted">
                      {detail.description}
                    </AppText>

                    <View style={styles.stats}>
                      <Stat value={String(detail.chain.locationCount)} label="Locations" />
                      <Stat value={String(openCount)} label="Open now" />
                      <Stat value={String(fastest)} label="Fastest min" />
                    </View>

                    <View style={styles.filters}>
                      {FILTERS.map(option => (
                        <Chip
                          key={option}
                          label={option}
                          selected={filter === option}
                          onPress={() => setFilter(option)}
                        />
                      ))}
                    </View>

                    <AppText variant="h2" style={styles.listTitle}>
                      Nearby locations
                    </AppText>
                  </View>
                </View>
              }
              ListEmptyComponent={
                <AppText variant="body" color="textMuted" align="center" style={styles.empty}>
                  No locations match that filter.
                </AppText>
              }
            />
          );
        }}
      </QueryBoundary>
    </Screen>
  );
}

const Separator = () => <View style={styles.separator} />;

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="h1">{value}</AppText>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
    </View>
  );
}

function ChainSkeleton() {
  return (
    <View style={styles.skeleton}>
      <Skeleton height={230} radius={0} />
      <View style={styles.skeletonBody}>
        <Skeleton height={18} width="80%" />
        <Skeleton height={86} radius={14} />
        <Skeleton height={38} width="70%" radius={999} />
        <Skeleton height={106} radius={14} />
        <Skeleton height={106} radius={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.huge },

  hero: { height: 230, backgroundColor: colors.primaryDark },
  heroImage: { ...StyleSheet.absoluteFill },
  heroScrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(6, 40, 63, 0.45)' },
  heroBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SCREEN_GUTTER,
  },
  heroCopy: {
    position: 'absolute',
    left: SCREEN_GUTTER,
    right: SCREEN_GUTTER,
    bottom: spacing.xl,
    gap: spacing.xs,
  },
  localRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },

  body: { paddingHorizontal: SCREEN_GUTTER, paddingTop: spacing.xl, gap: spacing.lg },
  stats: { flexDirection: 'row', gap: spacing.md },
  stat: {
    flex: 1,
    gap: spacing.xxs,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filters: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  listTitle: { marginTop: spacing.sm },

  rowGutter: { paddingHorizontal: SCREEN_GUTTER },
  separator: { height: spacing.md },
  empty: { paddingHorizontal: SCREEN_GUTTER, paddingTop: spacing.xl },

  skeleton: { flex: 1 },
  skeletonBody: { padding: SCREEN_GUTTER, gap: spacing.lg },
});

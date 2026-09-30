import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View, type ListRenderItem } from 'react-native';
import { FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { QueryBoundary, Screen } from '../../../components/layout';
import { AppImage, AppText, Badge, Button, Chip, Icon, SearchBar, Skeleton } from '../../../components/ui';
import { colors, radii, SCREEN_GUTTER, spacing } from '../../../theme';
import { formatPrice, pluralise } from '../../../utils';
import { useTabBarMetrics } from '../../../navigation/tabBarMetrics';
import type { Order } from '../../../types';
import type { RootStackParamList } from '../../../navigation/types';
import { useGetOrdersQuery } from '../api/ordersApi';
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  isOrderLive,
  orderProgress,
} from '../orderStatus';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const FILTERS = ['All', 'Preparing', 'Ready', 'Out for delivery', 'Delivered'] as const;
type Filter = (typeof FILTERS)[number];

export function OrderHistoryScreen() {
  const navigation = useNavigation<Navigation>();
  const { clearance } = useTabBarMetrics();
  const [filter, setFilter] = useState<Filter>('All');

  const query = useGetOrdersQuery();

  const openOrder = useCallback(
    (order: Order) => navigation.navigate('OrderDetail', { orderId: order.id }),
    [navigation],
  );

  const trackOrder = useCallback(
    (order: Order) => navigation.navigate('OrderTracking', { orderId: order.id }),
    [navigation],
  );

  const renderOrder = useCallback<ListRenderItem<Order>>(
    ({ item }) => (
      <PastOrderCard order={item} onPress={openOrder} onTrack={trackOrder} />
    ),
    [openOrder, trackOrder],
  );

  return (
    <Screen edges={['top']}>
      <QueryBoundary {...query} skeleton={<HistorySkeleton />}>
        {orders => {
          const live = orders.filter(order => isOrderLive(order.status));
          const past = orders
            .filter(order => !live.includes(order))
            .filter(order =>
              filter === 'All' ? true : ORDER_STATUS_LABEL[order.status] === filter,
            );

          const visibleLive =
            filter === 'All' ? live : live.filter(o => ORDER_STATUS_LABEL[o.status] === filter);

          return (
            <FlatList
              data={past}
              renderItem={renderOrder}
              keyExtractor={order => order.id}
              contentContainerStyle={[styles.content, { paddingBottom: clearance + spacing.xxl }]}
              ItemSeparatorComponent={Separator}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View style={styles.header}>
                  <AppText variant="eyebrow" color="textAccent">
                    Your account
                  </AppText>
                  <AppText variant="display">Order history</AppText>

                  <SearchBar
                    placeholder="Search orders or restaurants"
                    onPress={() => navigation.navigate('Search')}
                    style={styles.search}
                  />

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

                  {visibleLive.length > 0 ? (
                    <>
                      <AppText variant="eyebrow" color="textMuted" style={styles.groupLabel}>
                        Active now
                      </AppText>
                      {visibleLive.map(order => (
                        <LiveOrderCard
                          key={order.id}
                          order={order}
                          onTrack={trackOrder}
                          onDetails={openOrder}
                        />
                      ))}
                    </>
                  ) : null}

                  {past.length > 0 ? (
                    <AppText variant="eyebrow" color="textMuted" style={styles.groupLabel}>
                      Past orders
                    </AppText>
                  ) : null}
                </View>
              }
              ListEmptyComponent={
                <AppText variant="body" color="textMuted" align="center" style={styles.empty}>
                  No orders match that filter.
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

/** The dark "Active now" card with an ETA and rider. */
function LiveOrderCard({
  order,
  onTrack,
  onDetails,
}: {
  order: Order;
  onTrack: (order: Order) => void;
  onDetails: (order: Order) => void;
}) {
  return (
    <View style={styles.liveCard}>
      <View style={styles.liveTop}>
        <AppImage source={{ uri: order.merchantImageUrl }} style={styles.liveThumb} />
        <View style={styles.liveCopy}>
          <AppText variant="h3" color="textInverse" numberOfLines={1}>
            {order.merchantName}
          </AppText>
          <AppText variant="caption" color="textInverse" style={styles.dim}>
            {order.reference} · {pluralise(order.lines.length, 'item')}
          </AppText>
        </View>
        {order.etaMinutes !== undefined ? (
          <View style={styles.eta}>
            <AppText variant="priceLarge" color="accentBright">
              {order.etaMinutes}
            </AppText>
            <AppText variant="label" color="textInverse" style={styles.dim}>
              min ETA
            </AppText>
          </View>
        ) : null}
      </View>

      <ProgressTrack progress={orderProgress(order.status)} tone="light" />

      <AppText variant="caption" color="textInverse" style={styles.dim}>
        {ORDER_STATUS_LABEL[order.status]}
        {order.rider ? ` · ${order.rider.name}` : ''}
      </AppText>

      <View style={styles.liveActions}>
        <Button
          label="Track order"
          variant="soft"
          size="md"
          iconLeft="bike"
          style={styles.liveTrack}
          onPress={() => onTrack(order)}
        />
        <Button
          label="View details"
          size="md"
          variant="outline"
          tone="dark"
          onPress={() => onDetails(order)}
        />
      </View>
    </View>
  );
}

function PastOrderCard({
  order,
  onPress,
  onTrack,
}: {
  order: Order;
  onPress: (order: Order) => void;
  onTrack: (order: Order) => void;
}) {
  const isDelivered = order.status === 'delivered';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${order.merchantName}, ${ORDER_STATUS_LABEL[order.status]}`}
      onPress={() => onPress(order)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.cardTop}>
        <AppImage source={{ uri: order.merchantImageUrl }} style={styles.thumb} />
        <View style={styles.cardCopy}>
          <AppText variant="h3" numberOfLines={1}>
            {order.merchantName}
          </AppText>
          <AppText variant="caption" color="textSubtle">
            {order.reference} · {order.placedOn}
          </AppText>
          <AppText variant="caption" color="textMuted" numberOfLines={1}>
            {order.lines.map(line => line.name).join(', ')}
          </AppText>
        </View>
        <AppText variant="price">{formatPrice(order.total)}</AppText>
      </View>

      {order.status === 'preparing' ? <ProgressTrack progress={orderProgress(order.status)} /> : null}

      <View style={styles.cardFooter}>
        <Badge label={ORDER_STATUS_LABEL[order.status]} tone={ORDER_STATUS_TONE[order.status]} />

        <Pressable
          accessibilityRole="button"
          onPress={() => (isDelivered ? onPress(order) : onTrack(order))}
          style={styles.secondaryAction}>
          {isDelivered ? (
            <Icon name="bolt" size={14} color={colors.text} />
          ) : null}
          <AppText variant="captionStrong">{isDelivered ? 'Reorder' : 'Track'}</AppText>
        </Pressable>
      </View>
    </Pressable>
  );
}

function ProgressTrack({
  progress,
  tone = 'dark',
}: {
  progress: number;
  tone?: 'light' | 'dark';
}) {
  return (
    <View
      style={[styles.track, tone === 'light' && styles.trackLight]}
      accessible
      accessibilityLabel={`${Math.round(progress * 100)} percent complete`}>
      <View style={[styles.trackFill, { width: `${Math.max(progress, 0.02) * 100}%` }]} />
    </View>
  );
}

function HistorySkeleton() {
  return (
    <View style={styles.skeletonBody}>
      <Skeleton height={34} width="60%" />
      <Skeleton height={46} radius={10} />
      <Skeleton height={150} radius={18} />
      <Skeleton height={120} radius={14} />
      <Skeleton height={120} radius={14} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SCREEN_GUTTER },
  header: { paddingTop: spacing.sm, gap: spacing.xs },
  search: { marginTop: spacing.lg },
  filters: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', marginVertical: spacing.md },
  groupLabel: { marginTop: spacing.md, marginBottom: spacing.sm },

  liveCard: {
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  liveTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  liveThumb: { width: 48, height: 48, borderRadius: radii.md },
  liveCopy: { flex: 1, gap: spacing.xxs },
  dim: { opacity: 0.75 },
  eta: { alignItems: 'flex-end' },
  liveActions: { flexDirection: 'row', gap: spacing.md },
  liveTrack: { flex: 1 },

  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardTop: { flexDirection: 'row', gap: spacing.md },
  thumb: { width: 54, height: 54, borderRadius: radii.md },
  cardCopy: { flex: 1, gap: spacing.xxs },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },

  track: { height: 5, borderRadius: radii.pill, backgroundColor: colors.border, overflow: 'hidden' },
  trackLight: { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  trackFill: { height: 5, borderRadius: radii.pill, backgroundColor: colors.accent },

  separator: { height: spacing.md },
  empty: { paddingTop: spacing.xl },
  pressed: { opacity: 0.92 },
  skeletonBody: { padding: SCREEN_GUTTER, gap: spacing.lg },
});

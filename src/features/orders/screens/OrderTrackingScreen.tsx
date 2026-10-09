import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QueryBoundary, Screen } from '../../../components/layout';
import { AppImage, AppText, Icon, IconButton, Skeleton } from '../../../components/ui';
import { colors, radii, SCREEN_GUTTER, shadows, spacing } from '../../../theme';
import { formatDeliveryWindow, formatPrice, pluralise } from '../../../utils';
import type { Order } from '../../../types';
import type { RootStackParamList } from '../../../navigation/types';
import { useGetOrderQuery } from '../api/ordersApi';
import { ORDER_STATUS_COPY, isOrderLive, orderProgress } from '../orderStatus';
import { DeliveryMap } from '../components/DeliveryMap';
import { EtaRing } from '../components/EtaRing';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const MAP_HEIGHT = 300;
const RING_SIZE = 232;

/**
 * Live order tracking.
 *
 * Built around one question — when will it arrive — so the ETA is the largest
 * thing on the screen, sitting in a card that overlaps the map: the map gives
 * the answer context, the ring gives the answer. Everything else (who is
 * cooking, what was ordered, how to reach the rider) sits below in the order
 * someone asks for it while they wait.
 */
export function OrderTrackingScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<RouteProp<RootStackParamList, 'OrderTracking'>>();

  // Polling is what makes this screen "live"; RTK Query handles the timer and
  // stops it as soon as the screen unmounts.
  const query = useGetOrderQuery(params.orderId, { pollingInterval: 15_000 });

  return (
    <Screen edges={[]} background="surface">
      <QueryBoundary
        {...query}
        skeleton={<TrackingSkeleton />}
        errorTitle="We couldn't load this order">
        {order => {
          const progress = orderProgress(order.status);
          const copy = ORDER_STATUS_COPY[order.status];
          const live = isOrderLive(order.status);

          return (
            <ScrollView
              contentContainerStyle={[
                styles.content,
                { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.xl },
              ]}
              showsVerticalScrollIndicator={false}>
              <View style={styles.mapBlock}>
                <DeliveryMap
                  progress={progress}
                  merchantName={order.merchantName}
                  style={styles.map}
                />

                <View style={[styles.mapBar, { paddingTop: insets.top + spacing.sm }]}>
                  <IconButton
                    name="close"
                    accessibilityLabel="Close"
                    onPress={navigation.goBack}
                  />
                  <IconButton
                    name="shield"
                    accessibilityLabel="Get help with this order"
                    onPress={() => {}}
                  />
                </View>
              </View>

              <View style={styles.sheet}>
                <View style={styles.ringRow}>
                  <RingAction
                    icon="bell"
                    label={order.rider ? `Message ${order.rider.name}` : 'Messages'}
                    onPress={() => {}}
                  />

                  <EtaRing
                    size={RING_SIZE}
                    progress={progress}
                    value={
                      live && order.etaMinutes !== undefined
                        ? formatDeliveryWindow(
                            Math.max(order.etaMinutes - 5, 1),
                            order.etaMinutes,
                          ).replace(' min', '')
                        : '—'
                    }
                    caption={live ? 'minutes\nuntil delivery' : 'order complete'}
                  />

                  <RingAction
                    icon="card"
                    label="View receipt"
                    onPress={() =>
                      navigation.navigate('OrderDetail', { orderId: order.id })
                    }
                  />
                </View>

                <View style={styles.status}>
                  <AppText variant="eyebrow" color="textMuted" align="center">
                    {order.merchantName}
                  </AppText>
                  <AppText variant="h2" align="center" style={styles.headline}>
                    {copy.headline}
                  </AppText>
                  <AppText variant="body" color="textMuted" align="center">
                    {copy.detail}
                  </AppText>
                </View>

                {order.rider ? <RiderRow order={order} /> : null}

                <View style={styles.items}>
                  <AppText variant="eyebrow" color="textMuted">
                    What's coming
                  </AppText>
                  {order.lines.map(line => (
                    <View key={line.productId} style={styles.itemRow}>
                      <AppImage source={{ uri: line.imageUrl }} style={styles.itemThumb} />
                      <AppText variant="captionStrong" color="textAccent">
                        {line.quantity}×
                      </AppText>
                      <AppText variant="body" numberOfLines={1} style={styles.itemName}>
                        {line.name}
                      </AppText>
                      <AppText variant="price" color="textMuted">
                        {formatPrice(line.total)}
                      </AppText>
                    </View>
                  ))}
                </View>

                <View style={styles.summary}>
                  <View style={styles.summaryTop}>
                    <AppImage
                      source={{ uri: order.merchantImageUrl }}
                      style={styles.summaryThumb}
                    />
                    <View style={styles.summaryCopy}>
                      <AppText variant="bodyStrong" color="textInverse" numberOfLines={1}>
                        {pluralise(order.lines.length, 'item')} · {order.reference}
                      </AppText>
                      <AppText variant="caption" color="textInverse" style={styles.dim}>
                        {order.deliveryAddress}
                      </AppText>
                    </View>
                    <AppText variant="price" color="textInverse">
                      {formatPrice(order.total)}
                    </AppText>
                  </View>

                  <View style={styles.summaryDivider} />

                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      navigation.navigate('OrderDetail', { orderId: order.id })
                    }
                    style={({ pressed }) => [styles.summaryLink, pressed && styles.pressed]}>
                    <AppText variant="captionStrong" color="accentBright">
                      See the full order
                    </AppText>
                    <Icon name="chevronRight" size={13} color={colors.accentBright} />
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          );
        }}
      </QueryBoundary>
    </Screen>
  );
}

/** One of the two circular controls flanking the ring. */
function RingAction({
  icon,
  label,
  onPress,
}: {
  icon: 'bell' | 'card';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.ringAction, pressed && styles.pressed]}>
      <Icon name={icon} size={19} color={colors.text} />
    </Pressable>
  );
}

function RiderRow({ order }: { order: Order }) {
  if (!order.rider) {
    return null;
  }

  return (
    <View style={styles.rider}>
      <View style={styles.riderAvatar}>
        <AppText variant="captionStrong" color="textInverse">
          {order.rider.initials}
        </AppText>
      </View>
      <View style={styles.riderCopy}>
        <AppText variant="caption" color="textMuted">
          Your rider
        </AppText>
        <AppText variant="bodyStrong">{order.rider.name}</AppText>
      </View>
      <IconButton
        name="phone"
        accessibilityLabel={`Call ${order.rider.name}`}
        variant="outline"
        size={42}
        onPress={() => {}}
      />
    </View>
  );
}

function TrackingSkeleton() {
  return (
    <View style={styles.skeleton}>
      <Skeleton height={MAP_HEIGHT} radius={0} />
      <View style={styles.skeletonBody}>
        <Skeleton height={RING_SIZE} width={RING_SIZE} radius={999} style={styles.skeletonRing} />
        <Skeleton height={22} width="70%" />
        <Skeleton height={76} radius={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },

  mapBlock: { height: MAP_HEIGHT },
  map: { ...StyleSheet.absoluteFill },
  mapBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_GUTTER,
  },

  // Lifts over the map, which is what ties the answer to its context.
  sheet: {
    flex: 1,
    marginTop: -spacing.xxl,
    paddingHorizontal: SCREEN_GUTTER,
    paddingBottom: spacing.xl,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    backgroundColor: colors.surface,
    gap: spacing.xl,
  },

  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -(RING_SIZE / 3),
  },
  ringAction: {
    width: 46,
    height: 46,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: RING_SIZE / 3,
    ...shadows.card,
  },

  status: { gap: spacing.xs, marginTop: -spacing.md },
  headline: { paddingHorizontal: spacing.sm },

  rider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  riderAvatar: {
    width: 46,
    height: 46,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderCopy: { flex: 1, gap: spacing.xxs },

  items: { gap: spacing.sm },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  itemThumb: { width: 38, height: 38, borderRadius: radii.sm },
  itemName: { flex: 1 },

  summary: {
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
  },
  summaryTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  summaryThumb: { width: 44, height: 44, borderRadius: radii.md },
  summaryCopy: { flex: 1, gap: spacing.xxs },
  dim: { opacity: 0.75 },
  summaryDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginVertical: spacing.md,
  },
  summaryLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },

  pressed: { opacity: 0.8 },

  skeleton: { flex: 1 },
  skeletonBody: { padding: SCREEN_GUTTER, gap: spacing.lg, alignItems: 'center' },
  skeletonRing: { alignSelf: 'center' },
});

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { QueryBoundary, Screen } from '../../../components/layout';
import { AppText, Badge, Icon, IconButton, Skeleton } from '../../../components/ui';
import { colors, radii, SCREEN_GUTTER, spacing } from '../../../theme';
import { formatPrice, pluralise } from '../../../utils';
import type { OrderStatus } from '../../../types';
import type { RootStackParamList } from '../../../navigation/types';
import { useGetOrderQuery } from '../api/ordersApi';
import { ORDER_FLOW, ORDER_STATUS_LABEL, orderProgress } from '../orderStatus';
import { EtaRing } from '../components/EtaRing';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

/** The four milestones shown as icons under the ring. */
const MILESTONES: readonly { status: OrderStatus; icon: 'store' | 'bag' | 'bike' | 'check'; label: string }[] = [
  { status: 'preparing', icon: 'store', label: 'Kitchen' },
  { status: 'ready', icon: 'bag', label: 'Packed' },
  { status: 'out_for_delivery', icon: 'bike', label: 'Rider' },
  { status: 'delivered', icon: 'check', label: 'Done' },
];

export function OrderTrackingScreen() {
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'OrderTracking'>>();

  // Polling is what makes this screen "live"; RTK Query handles the timer and
  // stops it as soon as the screen unmounts.
  const query = useGetOrderQuery(params.orderId, { pollingInterval: 15_000 });

  return (
    <Screen edges={['top']}>
      <QueryBoundary {...query} skeleton={<TrackingSkeleton />} errorTitle="We couldn't load this order">
        {order => {
          const currentIndex = ORDER_FLOW.indexOf(order.status);

          return (
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.topBar}>
                <IconButton
                  name="close"
                  accessibilityLabel="Close"
                  variant="outline"
                  size={40}
                  onPress={navigation.goBack}
                />
                <Badge label="Live order" tone="danger" />
                <IconButton
                  name="chevronRight"
                  accessibilityLabel="Get help"
                  variant="outline"
                  size={40}
                  onPress={() => {}}
                />
              </View>

              <View style={styles.headline}>
                <AppText variant="body" color="textMuted">
                  Ordering from
                </AppText>
                <AppText variant="h1">{order.merchantName}</AppText>
              </View>

              <View style={styles.ringWrapper}>
                <EtaRing
                  minutes={order.etaMinutes ?? 0}
                  progress={orderProgress(order.status)}
                  label={ORDER_STATUS_LABEL[order.status]}
                />
              </View>

              <View style={styles.milestones}>
                {MILESTONES.map((milestone, index) => {
                  const milestoneIndex = ORDER_FLOW.indexOf(milestone.status);
                  const isDone = milestoneIndex < currentIndex;
                  const isCurrent = milestoneIndex === currentIndex;
                  const isLast = index === MILESTONES.length - 1;

                  return (
                    <React.Fragment key={milestone.status}>
                      <View style={styles.milestone}>
                        <View
                          style={[
                            styles.milestoneDot,
                            isDone && styles.milestoneDone,
                            isCurrent && styles.milestoneCurrent,
                          ]}>
                          <Icon
                            name={milestone.icon}
                            size={19}
                            color={isDone || isCurrent ? colors.textInverse : colors.textSubtle}
                          />
                        </View>
                        <AppText
                          variant="label"
                          color={isDone || isCurrent ? 'text' : 'textSubtle'}
                          align="center">
                          {milestone.label}
                        </AppText>
                      </View>

                      {!isLast ? (
                        <View style={[styles.milestoneLink, isDone && styles.milestoneLinkDone]} />
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </View>

              {order.rider ? (
                <View style={styles.card}>
                  <View style={styles.riderAvatar}>
                    <AppText variant="captionStrong" color="textInverse">
                      {order.rider.initials}
                    </AppText>
                  </View>
                  <View style={styles.riderCopy}>
                    <AppText variant="caption" color="textMuted">
                      Your rider
                    </AppText>
                    <AppText variant="h3">{order.rider.name}</AppText>
                  </View>
                  <IconButton
                    name="bell"
                    accessibilityLabel={`Message ${order.rider.name}`}
                    onPress={() => {}}
                    style={styles.riderChat}
                    color={colors.accentPressed}
                  />
                  <IconButton
                    name="phone"
                    accessibilityLabel={`Call ${order.rider.name}`}
                    onPress={() => {}}
                    style={styles.riderCall}
                    color={colors.textInverse}
                  />
                </View>
              ) : null}

              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Icon name="pin" size={17} color={colors.accentPressed} />
                  <View style={styles.summaryCopy}>
                    <AppText variant="caption" color="textMuted">
                      Delivery address
                    </AppText>
                    <AppText variant="bodyStrong">{order.deliveryAddress}</AppText>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.summaryRow}>
                  <Icon name="bag" size={17} color={colors.accentPressed} />
                  <View style={styles.summaryCopy}>
                    <AppText variant="caption" color="textMuted">
                      Your basket
                    </AppText>
                    <AppText variant="bodyStrong">
                      {pluralise(order.lines.length, 'item')} · {formatPrice(order.total)}
                    </AppText>
                  </View>
                  <AppText
                    variant="captionStrong"
                    color="textAccent"
                    onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}>
                    View receipt
                  </AppText>
                </View>
              </View>
            </ScrollView>
          );
        }}
      </QueryBoundary>
    </Screen>
  );
}

function TrackingSkeleton() {
  return (
    <View style={styles.skeletonBody}>
      <Skeleton height={28} width="50%" />
      <Skeleton height={210} width={210} radius={999} style={styles.skeletonRing} />
      <Skeleton height={70} radius={14} />
      <Skeleton height={130} radius={14} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: SCREEN_GUTTER, paddingBottom: spacing.huge, gap: spacing.xl },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headline: { alignItems: 'center', gap: spacing.xxs },
  ringWrapper: { alignItems: 'center' },

  milestones: { flexDirection: 'row', alignItems: 'center' },
  milestone: { alignItems: 'center', gap: spacing.xs, width: 64 },
  milestoneDot: {
    width: 50,
    height: 50,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneDone: { backgroundColor: colors.accent, borderColor: colors.accent },
  milestoneCurrent: { backgroundColor: colors.primary, borderColor: colors.primary },
  milestoneLink: { flex: 1, height: 2, backgroundColor: colors.border, marginBottom: spacing.lg },
  milestoneLinkDone: { backgroundColor: colors.accent },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  riderAvatar: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderCopy: { flex: 1, gap: spacing.xxs },
  riderChat: { backgroundColor: colors.accentSoft },
  riderCall: { backgroundColor: colors.accent },

  summaryCard: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  summaryCopy: { flex: 1, gap: spacing.xxs },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },

  skeletonBody: { padding: SCREEN_GUTTER, gap: spacing.xl, alignItems: 'center' },
  skeletonRing: { alignSelf: 'center' },
});

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { QueryBoundary, Screen } from '../../../components/layout';
import { AppImage, AppText, Button, Icon, Skeleton } from '../../../components/ui';
import { useAppSelector } from '../../../store/hooks';
import { selectUser } from '../../auth/authSlice';
import { colors, radii, SCREEN_GUTTER, spacing } from '../../../theme';
import { formatDeliveryWindow, formatPrice, pluralise } from '../../../utils';
import type { RootStackParamList } from '../../../navigation/types';
import { useGetOrderQuery } from '../api/ordersApi';
import { SuccessMark } from '../components/SuccessMark';
import { TicketCard } from '../components/TicketCard';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

/** Everything below the mark arrives just behind it, in reading order. */
const enter = (delay: number) =>
  FadeInDown.delay(delay).duration(420).springify().damping(16);

/**
 * Order confirmation.
 *
 * The one screen in the flow whose whole job is to say "that worked", so it is
 * built as a moment: the mark lands first and the rest follows it down the
 * page. The details sit on a ticket because that is what a confirmation is —
 * something you were handed and can keep — and the shape says so before any
 * of the words do.
 */
export function OrderConfirmationScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<RouteProp<RootStackParamList, 'OrderConfirmation'>>();
  const user = useAppSelector(selectUser);

  const query = useGetOrderQuery(params.orderId);

  return (
    <Screen edges={['top']}>
      <QueryBoundary {...query} skeleton={<ConfirmationSkeleton />}>
        {order => (
          <>
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}>
              <SuccessMark />

              <Animated.View entering={enter(240)} style={styles.headline}>
                <AppText variant="eyebrow" color="success" align="center">
                  Order confirmed
                </AppText>
                <AppText variant="display" align="center">
                  You're all set!
                </AppText>
                <AppText variant="body" color="textMuted" align="center">
                  {order.merchantName} has your order and is getting started.
                </AppText>
              </Animated.View>

              <Animated.View entering={enter(340)} style={styles.ticketWrapper}>
                <TicketCard
                  header={
                    <View style={styles.merchantRow}>
                      <AppImage
                        source={{ uri: order.merchantImageUrl }}
                        style={styles.thumb}
                      />
                      <View style={styles.merchantCopy}>
                        <AppText variant="bodyStrong" numberOfLines={1}>
                          {order.merchantName}
                        </AppText>
                        <AppText variant="caption" color="textMuted">
                          {pluralise(order.lines.length, 'item')}
                        </AppText>
                      </View>
                      <AppText variant="priceLarge">{formatPrice(order.total)}</AppText>
                    </View>
                  }
                  body={
                    <View style={styles.details}>
                      <DetailRow
                        icon="clock"
                        label="Arriving in"
                        value={formatDeliveryWindow(30, 40)}
                        emphasis
                      />
                      <DetailRow
                        icon="pin"
                        label="Deliver to"
                        value={order.deliveryAddress}
                      />
                      <DetailRow
                        icon="card"
                        label="Order number"
                        value={order.reference}
                        last
                      />
                    </View>
                  }
                />
              </Animated.View>

              {user ? (
                <Animated.View entering={enter(420)} style={styles.receipt}>
                  <Icon name="mail" size={15} color={colors.success} />
                  <AppText variant="captionStrong" color="success" numberOfLines={1}>
                    Receipt sent to {user.email}
                  </AppText>
                </Animated.View>
              ) : null}
            </ScrollView>

            <Animated.View
              entering={enter(500)}
              style={[
                styles.actions,
                { paddingBottom: Math.max(insets.bottom, spacing.lg) },
              ]}>
              <Button
                label="Track order"
                iconRight="arrowRight"
                onPress={() => navigation.replace('OrderTracking', { orderId: order.id })}
              />
              <Button
                label="Done"
                variant="outline"
                onPress={() => navigation.navigate('Main', { screen: 'HomeTab' })}
              />
            </Animated.View>
          </>
        )}
      </QueryBoundary>
    </Screen>
  );
}

function DetailRow({
  icon,
  label,
  value,
  emphasis = false,
  last = false,
}: {
  icon: 'clock' | 'pin' | 'card';
  label: string;
  value: string;
  emphasis?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, last && styles.detailRowLast]}>
      <View style={[styles.detailIcon, emphasis && styles.detailIconEmphasis]}>
        <Icon
          name={icon}
          size={16}
          color={emphasis ? colors.accentPressed : colors.textMuted}
        />
      </View>
      <AppText variant="body" color="textMuted">
        {label}
      </AppText>
      <AppText
        variant={emphasis ? 'bodyStrong' : 'caption'}
        color={emphasis ? 'text' : 'textMuted'}
        numberOfLines={1}
        style={styles.detailValue}>
        {value}
      </AppText>
    </View>
  );
}

function ConfirmationSkeleton() {
  return (
    <View style={styles.skeleton}>
      <Skeleton height={160} width={160} radius={999} style={styles.skeletonMark} />
      <Skeleton height={34} width="62%" />
      <Skeleton height={200} radius={20} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: SCREEN_GUTTER,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  headline: { alignSelf: 'stretch', gap: spacing.xs, marginTop: -spacing.xl },
  ticketWrapper: { alignSelf: 'stretch', marginTop: spacing.xxl },

  merchantRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  thumb: { width: 48, height: 48, borderRadius: radii.md },
  merchantCopy: { flex: 1, gap: spacing.xxs },

  details: { gap: spacing.xs },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailIconEmphasis: { backgroundColor: colors.accentSoft },
  detailValue: { flex: 1, textAlign: 'right' },

  receipt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.successSurface,
  },

  actions: {
    gap: spacing.md,
    paddingHorizontal: SCREEN_GUTTER,
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
  },

  skeleton: { flex: 1, padding: SCREEN_GUTTER, gap: spacing.lg, alignItems: 'center' },
  skeletonMark: { alignSelf: 'center' },
});

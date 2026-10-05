import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QueryBoundary, Screen } from '../../../components/layout';
import { AppImage, AppText, Button, Icon, Skeleton } from '../../../components/ui';
import { useAppSelector } from '../../../store/hooks';
import { selectUser } from '../../auth/authSlice';
import { colors, radii, SCREEN_GUTTER, spacing, surfaces } from '../../../theme';
import { formatDeliveryWindow, formatPrice, pluralise } from '../../../utils';
import type { RootStackParamList } from '../../../navigation/types';
import { useGetOrderQuery } from '../api/ordersApi';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

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
          <View style={styles.container}>
            <View style={styles.hero}>
              <View style={styles.haloOuter}>
                <View style={styles.haloInner}>
                  <View style={styles.check}>
                    <Icon name="check" size={40} color={colors.textInverse} strokeWidth={3} />
                  </View>
                </View>
              </View>

              <AppText variant="eyebrow" color="success">
                Order confirmed
              </AppText>
              <AppText variant="display" align="center">
                You're all set!
              </AppText>
              <AppText variant="body" color="textMuted" align="center">
                Your order has been confirmed and is now being prepared.
              </AppText>

              <View style={styles.card}>
                <View style={styles.referenceRow}>
                  <AppText variant="body" color="textMuted">
                    Order number
                  </AppText>
                  <AppText variant="price">{order.reference}</AppText>
                </View>

                <View style={styles.divider} />

                <View style={styles.merchantRow}>
                  <AppImage source={{ uri: order.merchantImageUrl }} style={styles.thumb} />
                  <View style={styles.merchantCopy}>
                    <AppText variant="bodyStrong" numberOfLines={1}>
                      {order.merchantName}
                    </AppText>
                    <AppText variant="caption" color="textMuted">
                      {pluralise(order.lines.length, 'item')} · Arriving in{' '}
                      {formatDeliveryWindow(30, 40)}
                    </AppText>
                  </View>
                  <AppText variant="price">{formatPrice(order.total)}</AppText>
                </View>

                {user ? (
                  <View style={styles.receipt}>
                    <Icon name="mail" size={15} color={colors.success} />
                    <AppText variant="captionStrong" color="success" numberOfLines={1}>
                      Receipt sent to {user.email}
                    </AppText>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
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
            </View>
          </View>
        )}
      </QueryBoundary>
    </Screen>
  );
}

function ConfirmationSkeleton() {
  return (
    <View style={styles.skeletonBody}>
      <Skeleton height={140} width={140} radius={999} style={styles.skeletonHalo} />
      <Skeleton height={34} width="60%" />
      <Skeleton height={160} radius={14} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between' },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: SCREEN_GUTTER,
  },

  // Two concentric washes behind the tick, as in the design.
  haloOuter: {
    width: 190,
    height: 190,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(46, 158, 68, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  haloInner: {
    width: 140,
    height: 140,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(46, 158, 68, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 92,
    height: 92,
    borderRadius: radii.pill,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    alignSelf: 'stretch',
    marginTop: spacing.xl,
    padding: spacing.lg,
    ...surfaces.card,
  },
  referenceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  merchantRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  thumb: { width: 46, height: 46, borderRadius: radii.md },
  merchantCopy: { flex: 1, gap: spacing.xxs },
  receipt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.successSurface,
  },

  actions: { gap: spacing.md, paddingHorizontal: SCREEN_GUTTER, paddingTop: spacing.lg },
  skeletonBody: { flex: 1, padding: SCREEN_GUTTER, gap: spacing.lg, alignItems: 'center' },
  skeletonHalo: { alignSelf: 'center' },
});

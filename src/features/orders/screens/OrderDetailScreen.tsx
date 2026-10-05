import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QueryBoundary, Screen, ScreenHeader } from '../../../components/layout';
import { AppText, Badge, Button, Icon, IconButton, Skeleton } from '../../../components/ui';
import { colors, radii, SCREEN_GUTTER, spacing, surfaces } from '../../../theme';
import { formatPrice } from '../../../utils';
import type { OrderEvent } from '../../../types';
import type { RootStackParamList } from '../../../navigation/types';
import { useGetOrderQuery } from '../api/ordersApi';
import { ORDER_FLOW, ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from '../orderStatus';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function OrderDetailScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<RouteProp<RootStackParamList, 'OrderDetail'>>();

  const query = useGetOrderQuery(params.orderId);

  return (
    <Screen edges={['top']}>
      <QueryBoundary {...query} skeleton={<DetailSkeleton />} errorTitle="We couldn't load this order">
        {order => (
          <>
            <ScreenHeader
              title={`Order ${order.reference}`}
              subtitle={`${order.placedOn} · ${order.merchantName}`}
              action={
                <IconButton
                  name="close"
                  accessibilityLabel="Get help with this order"
                  variant="outline"
                  size={40}
                  onPress={() => {}}
                />
              }
              bordered
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.card}>
                <View style={styles.totalHeader}>
                  <View style={styles.totalCopy}>
                    <AppText variant="caption" color="textMuted">
                      Order total
                    </AppText>
                    <AppText variant="priceLarge">{formatPrice(order.total)}</AppText>
                  </View>
                  <Badge
                    label={ORDER_STATUS_LABEL[order.status]}
                    tone={ORDER_STATUS_TONE[order.status]}
                  />
                </View>

                <View style={styles.divider} />

                <AppText variant="h3" style={styles.blockTitle}>
                  Order status
                </AppText>
                <Timeline timeline={order.timeline} />
              </View>

              <View style={styles.card}>
                <AppText variant="h3" style={styles.blockTitle}>
                  Items
                </AppText>
                {order.lines.map(line => (
                  <View key={line.productId} style={styles.itemRow}>
                    <AppText variant="captionStrong" color="textAccent">
                      {line.quantity}×
                    </AppText>
                    <AppText variant="body" style={styles.itemName} numberOfLines={1}>
                      {line.name}
                    </AppText>
                    <AppText variant="price">{formatPrice(line.total)}</AppText>
                  </View>
                ))}
              </View>

              <View style={styles.card}>
                <AppText variant="h3" style={styles.blockTitle}>
                  Delivery &amp; payment
                </AppText>

                <View style={styles.metaRow}>
                  <Icon name="pin" size={17} color={colors.accentPressed} />
                  <AppText variant="body">{order.deliveryAddress}</AppText>
                </View>
                <View style={styles.metaRow}>
                  <Icon name="card" size={17} color={colors.accentPressed} />
                  <AppText variant="body">{order.paymentLabel}</AppText>
                </View>

                <View style={styles.divider} />

                <TotalRow label="Subtotal" value={formatPrice(order.subtotal)} />
                <TotalRow label="Delivery" value={formatPrice(order.deliveryFee)} />
                <TotalRow label="VAT included" value={formatPrice(order.vat)} />
                <View style={styles.divider} />
                <TotalRow label="Total" value={formatPrice(order.total)} emphasis />
              </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
              <Button label="Receipt" variant="outline" style={styles.footerButton} onPress={() => {}} />
              <Button
                label="Reorder"
                iconLeft="bolt"
                style={styles.footerButton}
                onPress={() => navigation.navigate('Merchant', { merchantId: order.merchantId })}
              />
            </View>
          </>
        )}
      </QueryBoundary>
    </Screen>
  );
}

/** Vertical status list — a filled dot and rule per completed step. */
function Timeline({ timeline }: { timeline: readonly OrderEvent[] }) {
  const reached = new Map(timeline.map(event => [event.status, event.at]));
  const isCancelled = reached.has('cancelled');
  const steps = isCancelled ? (['placed', 'cancelled'] as const) : ORDER_FLOW;

  return (
    <View>
      {steps.map((status, index) => {
        const at = reached.get(status);
        const isDone = at !== undefined;
        const isLast = index === steps.length - 1;

        return (
          <View key={status} style={styles.step}>
            <View style={styles.stepRail}>
              <View style={[styles.stepDot, isDone && styles.stepDotDone]}>
                {isDone ? (
                  <Icon name="check" size={12} color={colors.textInverse} strokeWidth={3} />
                ) : null}
              </View>
              {!isLast ? <View style={[styles.stepLine, isDone && styles.stepLineDone]} /> : null}
            </View>

            <View style={styles.stepBody}>
              <AppText variant="bodyStrong" color={isDone ? 'text' : 'textSubtle'}>
                {ORDER_STATUS_LABEL[status]}
              </AppText>
              <AppText variant="priceSmall" color="textSubtle">
                {at ?? '—'}
              </AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function TotalRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <View style={styles.totalRow}>
      <AppText variant={emphasis ? 'h3' : 'body'} color={emphasis ? 'text' : 'textMuted'}>
        {label}
      </AppText>
      <AppText variant={emphasis ? 'priceLarge' : 'price'}>{value}</AppText>
    </View>
  );
}

function DetailSkeleton() {
  return (
    <View style={styles.skeletonBody}>
      <Skeleton height={130} radius={14} />
      <Skeleton height={230} radius={14} />
      <Skeleton height={170} radius={14} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: SCREEN_GUTTER, paddingBottom: spacing.huge, gap: spacing.lg },
  card: {
    padding: spacing.lg,
    ...surfaces.card,
  },
  totalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalCopy: { gap: spacing.xxs },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  blockTitle: { marginBottom: spacing.md },

  step: { flexDirection: 'row', gap: spacing.md },
  stepRail: { alignItems: 'center', width: 26 },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: { backgroundColor: colors.success, borderColor: colors.success },
  stepLine: { flex: 1, width: 2, backgroundColor: colors.border, minHeight: 22 },
  stepLineDone: { backgroundColor: colors.success },
  stepBody: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.xl,
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  itemName: { flex: 1 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },

  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: SCREEN_GUTTER,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
  },
  footerButton: { flex: 1 },
  skeletonBody: { padding: SCREEN_GUTTER, gap: spacing.lg },
});

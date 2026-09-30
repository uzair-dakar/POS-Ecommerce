import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen, ScreenHeader } from '../../../components/layout';
import {
  AppImage,
  AppText,
  Button,
  Icon,
  QuantityStepper,
  TextField,
} from '../../../components/ui';
import { colors, radii, SCREEN_GUTTER, spacing } from '../../../theme';
import { formatPrice } from '../../../utils';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import type { RootStackParamList } from '../../../navigation/types';
import {
  basketCleared,
  lineQuantityChanged,
  selectBasket,
  selectBasketSummary,
  type BasketLine,
} from '../basketSlice';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

/** VAT is included in Maltese prices; this is the portion, not an addition. */
const VAT_RATE = 0.18;

export function BasketScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const basket = useAppSelector(selectBasket);
  const summary = useAppSelector(selectBasketSummary);

  const setQuantity = useCallback(
    (line: BasketLine, quantity: number) => {
      dispatch(lineQuantityChanged({ productId: line.productId, quantity }));
    },
    [dispatch],
  );

  const clear = useCallback(() => {
    dispatch(basketCleared());
    navigation.goBack();
  }, [dispatch, navigation]);

  if (summary.isEmpty) {
    return (
      <Screen edges={['top']}>
        <ScreenHeader title="Your basket" />
        <View style={styles.empty}>
          <AppText variant="h2" align="center">
            Your basket is empty
          </AppText>
          <AppText variant="body" color="textMuted" align="center">
            Add something from a restaurant or market and it will show up here.
          </AppText>
          <Button label="Start an order" fullWidth={false} onPress={navigation.goBack} />
        </View>
      </Screen>
    );
  }

  const vat = Math.round(summary.subtotal * VAT_RATE);

  return (
    <Screen edges={['top']}>
      <ScreenHeader
        title="Your basket"
        subtitle={summary.merchantName ?? undefined}
        action={
          <Pressable accessibilityRole="button" hitSlop={8} onPress={clear}>
            <AppText variant="captionStrong" color="textAccent">
              Clear
            </AppText>
          </Pressable>
        }
      />

      <ProgressBar />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {basket.lines.map((line, index) => (
            <View
              key={`${line.productId}-${line.optionsSummary ?? ''}`}
              style={[styles.line, index === basket.lines.length - 1 && styles.lineLast]}>
              <AppImage source={{ uri: line.imageUrl }} style={styles.thumb} />

              <View style={styles.lineBody}>
                <AppText variant="bodyStrong" numberOfLines={1}>
                  {line.name}
                </AppText>
                {line.optionsSummary ? (
                  <AppText variant="caption" color="textMuted" numberOfLines={1}>
                    {line.optionsSummary}
                  </AppText>
                ) : null}
                <AppText variant="price">{formatPrice(line.unitPrice * line.quantity)}</AppText>
              </View>

              <QuantityStepper
                compact
                quantity={line.quantity}
                onIncrement={() => setQuantity(line, line.quantity + 1)}
                onDecrement={() => setQuantity(line, line.quantity - 1)}
              />
            </View>
          ))}

          <Pressable
            accessibilityRole="button"
            onPress={navigation.goBack}
            style={styles.addMore}>
            <Icon name="plus" size={16} color={colors.accentPressed} strokeWidth={2.6} />
            <AppText variant="captionStrong" color="textAccent">
              Add more items
            </AppText>
          </Pressable>
        </View>

        <AppText variant="h2" style={styles.sectionTitle}>
          Delivery details
        </AppText>

        <View style={styles.card}>
          <DetailRow
            icon="pin"
            label="Delivery address"
            value="12 Triq Hal Taxien, Valletta"
            onChange={() => navigation.navigate('Addresses')}
          />
          <DetailRow icon="clock" label="When" value="Standard · 30-40 min" onChange={() => {}} />
          <DetailRow icon="card" label="Payment" value="Visa •••• 4421" onChange={() => {}} last />
        </View>

        <View style={styles.promo}>
          <TextField icon="gift" placeholder="Promo code" containerStyle={styles.promoField} />
          <Pressable accessibilityRole="button" style={styles.promoApply}>
            <AppText variant="captionStrong" color="textAccent">
              Apply
            </AppText>
          </Pressable>
        </View>

        <View style={styles.card}>
          <TotalRow label="Subtotal" value={formatPrice(summary.subtotal)} />
          <TotalRow label="Delivery" value={formatPrice(basket.deliveryFee)} />
          <TotalRow label="VAT (18%) included" value={formatPrice(vat)} />
          <View style={styles.totalDivider} />
          <TotalRow label="Total" value={formatPrice(summary.total)} emphasis />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <View style={styles.secure}>
          <Icon name="shield" size={14} color={colors.success} />
          <AppText variant="caption" color="textMuted">
            Secure checkout
          </AppText>
        </View>
        <Button
          label="Place order"
          trailingLabel={formatPrice(summary.total)}
          iconRight="arrowRight"
          onPress={() => navigation.navigate('Checkout')}
        />
      </View>
    </Screen>
  );
}

/** "1 Review —— 2 Confirm" step indicator from the design. */
function ProgressBar() {
  return (
    <View style={styles.progress}>
      <View style={styles.step}>
        <View style={[styles.stepDot, styles.stepDotActive]}>
          <AppText variant="label" color="textInverse">
            1
          </AppText>
        </View>
        <AppText variant="captionStrong">Review</AppText>
      </View>

      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>

      <View style={styles.step}>
        <View style={styles.stepDot}>
          <AppText variant="label" color="textMuted">
            2
          </AppText>
        </View>
        <AppText variant="captionStrong" color="textMuted">
          Confirm
        </AppText>
      </View>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
  onChange,
  last = false,
}: {
  icon: 'pin' | 'clock' | 'card';
  label: string;
  value: string;
  onChange: () => void;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, last && styles.lineLast]}>
      <View style={styles.detailIcon}>
        <Icon name={icon} size={17} color={colors.accentPressed} />
      </View>
      <View style={styles.detailCopy}>
        <AppText variant="caption" color="textMuted">
          {label}
        </AppText>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {value}
        </AppText>
      </View>
      <Pressable accessibilityRole="button" hitSlop={8} onPress={onChange}>
        <AppText variant="captionStrong" color="textAccent">
          Change
        </AppText>
      </Pressable>
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
      <AppText variant={emphasis ? 'h2' : 'body'} color={emphasis ? 'text' : 'textMuted'}>
        {label}
      </AppText>
      <AppText variant={emphasis ? 'priceLarge' : 'price'}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: SCREEN_GUTTER, paddingBottom: spacing.huge, gap: spacing.lg },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },

  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: SCREEN_GUTTER,
    paddingBottom: spacing.lg,
  },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  stepDotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  progressTrack: { flex: 1, height: 3, borderRadius: radii.pill, backgroundColor: colors.border },
  progressFill: { width: '50%', height: 3, borderRadius: radii.pill, backgroundColor: colors.accent },

  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  lineLast: { borderBottomWidth: 0 },
  thumb: { width: 54, height: 54, borderRadius: radii.md },
  lineBody: { flex: 1, gap: spacing.xxs },
  addMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },

  sectionTitle: { marginTop: spacing.xs },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  detailIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCopy: { flex: 1, gap: spacing.xxs },

  promo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  promoField: { flex: 1 },
  promoApply: { paddingHorizontal: spacing.sm },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  totalDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.divider },

  footer: {
    gap: spacing.sm,
    paddingHorizontal: SCREEN_GUTTER,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
  },
  secure: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
});

import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { QueryBoundary, Screen, ScreenHeader } from '../../../components/layout';
import { AppText, Badge, Button, Icon, QuantityStepper, Skeleton } from '../../../components/ui';
import { colors, radii, SCREEN_GUTTER, spacing, surfaces } from '../../../theme';
import { formatReservationDate, formatTime } from '../../../utils';
import type { SeatingKind, SeatingOption } from '../../../types';
import type { RootStackParamList } from '../../../navigation/types';
import { useGetAvailabilityQuery } from '../api/reservationsApi';
import { MonthCalendar, toIso } from '../components/MonthCalendar';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const SEATING_ICON: Record<SeatingKind, 'store' | 'bolt' | 'card' | 'pin'> = {
  standard: 'store',
  outdoor: 'bolt',
  high_top: 'card',
  counter: 'pin',
};

export function ReservationDateTimeScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<RouteProp<RootStackParamList, 'ReservationDateTime'>>();

  const today = new Date();
  const [date, setDate] = useState(() => toIso(today));
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [time, setTime] = useState<string>();
  const [guests, setGuests] = useState(2);
  const [seating, setSeating] = useState<SeatingKind>('standard');

  const query = useGetAvailabilityQuery({ merchantId: params.merchantId, date });

  const proceed = useCallback(() => {
    if (!time) {
      return;
    }
    navigation.navigate('ReservationDetails', {
      merchantId: params.merchantId,
      date,
      time,
      guests,
      seating,
    });
  }, [navigation, params.merchantId, date, time, guests, seating]);

  return (
    <Screen edges={['top']}>
      <QueryBoundary {...query} skeleton={<AvailabilitySkeleton />}>
        {availability => (
          <>
            <ScreenHeader title="Reservation" subtitle={availability.merchantName} bordered />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.intro}>
                <AppText variant="eyebrow" color="textAccent">
                  Step 1 of 2
                </AppText>
                <AppText variant="display">Date &amp; time</AppText>
                <AppText variant="body" color="textMuted">
                  Choose when you'd like to visit
                </AppText>
              </View>

              <MonthCalendar
                value={date}
                onChange={setDate}
                month={month}
                onChangeMonth={setMonth}
                minDate={today}
              />

              <View style={styles.block}>
                <View style={styles.blockHeader}>
                  <AppText variant="h2">Time</AppText>
                  <AppText variant="caption" color="textMuted">
                    {formatReservationDate(date)}
                  </AppText>
                </View>

                <View style={styles.slots}>
                  {availability.slots.map(slot => {
                    const isSelected = slot.time === time;
                    return (
                      <Pressable
                        key={slot.time}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected, disabled: !slot.isAvailable }}
                        disabled={!slot.isAvailable}
                        onPress={() => setTime(slot.time)}
                        style={[
                          styles.slot,
                          isSelected && styles.slotSelected,
                          !slot.isAvailable && styles.slotUnavailable,
                        ]}>
                        <AppText
                          variant="captionStrong"
                          color={isSelected ? 'textInverse' : slot.isAvailable ? 'text' : 'textSubtle'}
                          style={!slot.isAvailable ? styles.strike : undefined}>
                          {formatTime(slot.time)}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.guestsCard}>
                <View style={styles.guestsIcon}>
                  <Icon name="user" size={18} color={colors.accentPressed} />
                </View>
                <View style={styles.guestsCopy}>
                  <AppText variant="caption" color="textMuted">
                    Guests
                  </AppText>
                  <AppText variant="bodyStrong">
                    {guests} {guests === 1 ? 'guest' : 'guests'}
                  </AppText>
                </View>
                <QuantityStepper
                  quantity={guests}
                  min={1}
                  max={availability.maxGuests}
                  onIncrement={() => setGuests(g => g + 1)}
                  onDecrement={() => setGuests(g => g - 1)}
                />
              </View>

              <View style={styles.block}>
                <AppText variant="h2">Seating</AppText>
                <AppText variant="body" color="textMuted">
                  Choose your preferred seating for {guests}
                </AppText>

                <View style={styles.seatingGrid}>
                  {availability.seating.map(option => (
                    <SeatingCard
                      key={option.kind}
                      option={option}
                      selected={option.kind === seating}
                      onPress={() => setSeating(option.kind)}
                    />
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
              <View style={styles.summaryRow}>
                <AppText variant="caption" color="textMuted">
                  {formatReservationDate(date)}
                  {time ? ` · ${formatTime(time)}` : ''} · {guests} guests
                </AppText>
                <AppText variant="captionStrong">
                  {availability.seating.find(s => s.kind === seating)?.name}
                </AppText>
              </View>
              <Button
                label="Continue"
                iconRight="arrowRight"
                disabled={!time}
                onPress={proceed}
              />
            </View>
          </>
        )}
      </QueryBoundary>
    </Screen>
  );
}

function SeatingCard({
  option,
  selected,
  onPress,
}: {
  option: SeatingOption;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: !option.isAvailable }}
      disabled={!option.isAvailable}
      onPress={onPress}
      style={[
        styles.seatingCard,
        selected && styles.seatingCardSelected,
        !option.isAvailable && styles.seatingCardDisabled,
      ]}>
      <View style={[styles.seatingIcon, selected && styles.seatingIconSelected]}>
        <Icon
          name={SEATING_ICON[option.kind]}
          size={18}
          color={selected ? colors.accentPressed : colors.textMuted}
        />
      </View>

      <AppText variant="h3" color={selected ? 'textInverse' : option.isAvailable ? 'text' : 'textSubtle'}>
        {option.name}
      </AppText>
      <AppText variant="caption" color={selected ? 'textInverse' : 'textMuted'}>
        {option.description}
      </AppText>

      {selected ? (
        <Badge label="✓" tone="accent" style={styles.seatingCheck} />
      ) : null}
    </Pressable>
  );
}

function AvailabilitySkeleton() {
  return (
    <View style={styles.skeletonBody}>
      <Skeleton height={34} width="55%" />
      <Skeleton height={300} radius={14} />
      <Skeleton height={120} radius={14} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: SCREEN_GUTTER, paddingBottom: spacing.huge, gap: spacing.xl },
  intro: { gap: spacing.xxs },

  block: { gap: spacing.md },
  blockHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  slot: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  slotSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotUnavailable: { borderStyle: 'dashed', backgroundColor: colors.transparent },
  strike: { textDecorationLine: 'line-through' },

  guestsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    ...surfaces.card,
  },
  guestsIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestsCopy: { flex: 1, gap: spacing.xxs },

  seatingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  seatingCard: {
    width: '47.5%',
    flexGrow: 1,
    gap: spacing.xs,
    padding: spacing.lg,
    ...surfaces.card,
  },
  seatingCardSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  seatingCardDisabled: { opacity: 0.5 },
  seatingIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  seatingIconSelected: { backgroundColor: colors.accentSoft },
  seatingCheck: { position: 'absolute', top: spacing.md, right: spacing.md },

  footer: {
    gap: spacing.md,
    paddingHorizontal: SCREEN_GUTTER,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  skeletonBody: { padding: SCREEN_GUTTER, gap: spacing.lg },
});

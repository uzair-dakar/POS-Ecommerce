import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen, ScreenHeader } from '../../../components/layout';
import { AppText, Button, Checkbox, Chip, Icon, TextField } from '../../../components/ui';
import { colors, radii, SCREEN_GUTTER, spacing, textVariants, surfaces } from '../../../theme';
import { formatCountdown, formatReservationDate, formatTime } from '../../../utils';
import { useForm } from '../../../hooks/useForm';
import { phoneNumber, required } from '../../../utils/validation';
import { useAppSelector } from '../../../store/hooks';
import { selectUser } from '../../auth/authSlice';
import type { SeatingKind } from '../../../types';
import type { RootStackParamList } from '../../../navigation/types';
import { useCreateReservationMutation } from '../api/reservationsApi';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const OCCASIONS = ['Birthday', 'Anniversary', 'Date night', 'Business meal', 'Celebration', 'Other'];

const SEATING_NAME: Record<SeatingKind, string> = {
  standard: 'Standard',
  outdoor: 'Outdoor',
  high_top: 'High Top',
  counter: 'Counter',
};

/** How long the restaurant holds the table while the form is filled in. */
const HOLD_SECONDS = 5 * 60;

type DetailsValues = {
  fullName: string;
  phone: string;
};

const schema = {
  fullName: required('Full name'),
  phone: phoneNumber,
};

export function ReservationDetailsScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<RouteProp<RootStackParamList, 'ReservationDetails'>>();
  const user = useAppSelector(selectUser);

  const [createReservation, { isLoading, error }] = useCreateReservationMutation();
  const [occasion, setOccasion] = useState<string>();
  const [specialRequest, setSpecialRequest] = useState('');
  const [wantsTextUpdates, setWantsTextUpdates] = useState(true);
  const [wantsRestaurantNews, setWantsRestaurantNews] = useState(false);
  const [wantsDiningNews, setWantsDiningNews] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(HOLD_SECONDS);

  // The hold is real information, so the countdown has to keep running even
  // while the user is typing.
  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft(current => Math.max(current - 1, 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const submit = useCallback(
    async (values: DetailsValues) => {
      const reservation = await createReservation({
        merchantId: params.merchantId,
        date: params.date,
        time: params.time,
        guests: params.guests,
        seating: params.seating,
        fullName: values.fullName,
        phone: values.phone,
        occasion,
        specialRequest: specialRequest.trim() || undefined,
        wantsTextUpdates,
      }).unwrap();

      navigation.replace('ReservationConfirmed', {
        reservationNumber: reservation.reference,
        merchantId: params.merchantId,
        merchantName: reservation.merchantName,
        date: reservation.date,
        time: reservation.time,
        guests: reservation.guests,
        seatingName: SEATING_NAME[reservation.seating],
      });
    },
    [
      createReservation,
      params,
      occasion,
      specialRequest,
      wantsTextUpdates,
      navigation,
    ],
  );

  const form = useForm<DetailsValues>({
    initialValues: {
      fullName: user ? `${user.firstName} ${user.lastName}` : '',
      phone: user?.phone ?? '',
    },
    schema,
    onSubmit: submit,
  });

  const hasExpired = secondsLeft === 0;

  return (
    <Screen edges={['top']}>
      <ScreenHeader title="Reservation details" subtitle="Burger O'Clock Valletta" bordered />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: 'padding', default: undefined })}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={[styles.hold, hasExpired && styles.holdExpired]}>
            <Icon
              name="clock"
              size={18}
              color={hasExpired ? colors.danger : colors.accentPressed}
            />
            <AppText variant="captionStrong" style={styles.holdCopy}>
              {hasExpired
                ? 'This table is no longer on hold. Pick another time.'
                : "You're almost done! We're holding this table for"}
            </AppText>
            {!hasExpired ? (
              <AppText variant="price">{formatCountdown(secondsLeft)}</AppText>
            ) : null}
          </View>

          <View style={styles.summary}>
            <SummaryItem icon="calendar" label={formatReservationDate(params.date)} />
            <SummaryItem icon="clock" label={formatTime(params.time)} />
            <SummaryItem icon="user" label={`${params.guests} · Standard`} />
          </View>

          <View style={styles.intro}>
            <AppText variant="eyebrow" color="textAccent">
              Step 2 of 2
            </AppText>
            <AppText variant="display">Booking as</AppText>
          </View>

          <TextField
            label="Full name"
            icon="user"
            placeholder="Sara Borg"
            autoComplete="name"
            {...form.fieldProps('fullName')}
          />

          <TextField
            label="Phone"
            icon="phone"
            placeholder="+356 9931 8386"
            keyboardType="phone-pad"
            autoComplete="tel"
            {...form.fieldProps('phone')}
          />

          <View style={styles.block}>
            <AppText variant="captionStrong" color="primaryMuted">
              Occasion <AppText variant="caption" color="textMuted">(optional)</AppText>
            </AppText>
            <View style={styles.occasions}>
              {OCCASIONS.map(option => (
                <Chip
                  key={option}
                  label={option}
                  selected={occasion === option}
                  onPress={() => setOccasion(current => (current === option ? undefined : option))}
                />
              ))}
            </View>
          </View>

          <View style={styles.block}>
            <AppText variant="captionStrong" color="primaryMuted">
              Special request
            </AppText>
            <TextInput
              style={styles.textArea}
              placeholder="Window seat if possible, celebrating our anniversary…"
              placeholderTextColor={colors.textSubtle}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={specialRequest}
              onChangeText={setSpecialRequest}
              accessibilityLabel="Special request"
            />
          </View>

          <View style={styles.consents}>
            <Checkbox
              checked={wantsRestaurantNews}
              onChange={setWantsRestaurantNews}
              accessibilityLabel="Send me offers and news from this restaurant">
              <AppText variant="body" color="textMuted">
                Send me offers and news from this restaurant.
              </AppText>
            </Checkbox>
            <Checkbox
              checked={wantsDiningNews}
              onChange={setWantsDiningNews}
              accessibilityLabel="Sign me up to receive dining offers and news by email">
              <AppText variant="body" color="textMuted">
                Sign me up to receive dining offers and news by email.
              </AppText>
            </Checkbox>
            <Checkbox
              checked={wantsTextUpdates}
              onChange={setWantsTextUpdates}
              accessibilityLabel="Get text updates and reminders about my reservations">
              <AppText variant="body" color="textMuted">
                Yes, I want to get text updates and reminders about my reservations.
              </AppText>
            </Checkbox>
          </View>

          {error ? (
            <AppText variant="caption" color="danger">
              {'message' in error ? String(error.message) : 'Could not complete your reservation.'}
            </AppText>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <Button
            label={hasExpired ? 'Choose another time' : 'Complete reservation'}
            loading={isLoading}
            onPress={hasExpired ? navigation.goBack : form.handleSubmit}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function SummaryItem({ icon, label }: { icon: 'calendar' | 'clock' | 'user'; label: string }) {
  return (
    <View style={styles.summaryItem}>
      <Icon name={icon} size={16} color={colors.accentPressed} />
      <AppText variant="captionStrong" numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: SCREEN_GUTTER, paddingBottom: spacing.huge, gap: spacing.lg },

  hold: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.accentSoft,
  },
  holdExpired: { backgroundColor: colors.dangerSurface },
  holdCopy: { flex: 1 },

  summary: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    ...surfaces.card,
  },
  summaryItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },

  intro: { gap: spacing.xxs, marginTop: spacing.sm },
  block: { gap: spacing.sm },
  occasions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },

  textArea: {
    minHeight: 110,
    padding: spacing.lg,
    color: colors.text,
    ...textVariants.body,
    ...surfaces.outlined,
  },

  consents: { gap: spacing.lg, marginTop: spacing.sm },

  footer: {
    paddingHorizontal: SCREEN_GUTTER,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
  },
});

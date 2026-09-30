import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';

import { Screen } from '../../../components/layout';
import { AppImage, AppText, Button, Icon } from '../../../components/ui';
import { colors, radii, SCREEN_GUTTER, spacing } from '../../../theme';
import { formatReservationDate, formatTime } from '../../../utils';
import type { RootStackParamList } from '../../../navigation/types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=70';

export function ReservationConfirmedScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { params } = useRoute<RouteProp<RootStackParamList, 'ReservationConfirmed'>>();
  const [copied, setCopied] = useState(false);

  const copyReference = useCallback(() => {
    Clipboard.setString(params.reservationNumber);
    setCopied(true);
    // Revert the label so the control reads as reusable, not permanently done.
    setTimeout(() => setCopied(false), 2000);
  }, [params.reservationNumber]);

  return (
    <Screen edges={[]} background="background" statusBarStyle="light-content">
      <View style={styles.hero}>
        <AppImage source={{ uri: HERO_IMAGE }} style={StyleSheet.absoluteFill as never} />
        <View style={styles.heroScrim} />

        <View style={[styles.heroCopy, { paddingTop: insets.top + spacing.huge }]}>
          <View style={styles.check}>
            <Icon name="check" size={34} color={colors.primary} strokeWidth={3} />
          </View>
          <AppText variant="eyebrow" color="accentBright">
            Reservation confirmed
          </AppText>
          <AppText variant="display" color="textInverse" align="center">
            You're on the list.
          </AppText>
          <AppText variant="body" color="textInverse" align="center" style={styles.dim}>
            Your table at {params.merchantName ?? "Burger O'Clock Valletta"}
          </AppText>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.card}>
          <View style={styles.referenceRow}>
            <View style={styles.referenceCopy}>
              <AppText variant="caption" color="textMuted">
                Reservation number
              </AppText>
              <AppText variant="priceLarge">{params.reservationNumber}</AppText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Copy reservation number"
              onPress={copyReference}
              style={styles.copy}>
              <Icon name={copied ? 'check' : 'card'} size={15} color={colors.text} />
              <AppText variant="captionStrong">{copied ? 'Copied' : 'Copy'}</AppText>
            </Pressable>
          </View>

          <View style={styles.divider} />

          <View style={styles.facts}>
            <Fact icon="calendar" label="Date" value={formatReservationDate(params.date)} />
            <Fact icon="clock" label="Time" value={formatTime(params.time)} />
            <Fact icon="user" label="Guests" value={`${params.guests} guests`} />
            <Fact icon="store" label="Seating" value={params.seatingName} />
          </View>
        </View>

        <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <Button label="Add to calendar" iconLeft="calendar" onPress={() => {}} />
          <Button
            label="Back to restaurant"
            variant="outline"
            onPress={() => navigation.popTo('Merchant', { merchantId: params.merchantId })}
          />
        </View>
      </View>
    </Screen>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: 'calendar' | 'clock' | 'user' | 'store';
  label: string;
  value: string;
}) {
  return (
    <View style={styles.fact}>
      <View style={styles.factIcon}>
        <Icon name={icon} size={17} color={colors.accentPressed} />
      </View>
      <View style={styles.factCopy}>
        <AppText variant="caption" color="textMuted">
          {label}
        </AppText>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {value}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: '46%', backgroundColor: colors.primaryDark },
  heroScrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(6, 40, 63, 0.72)' },
  heroCopy: { flex: 1, alignItems: 'center', gap: spacing.sm, paddingHorizontal: SCREEN_GUTTER },
  check: {
    width: 86,
    height: 86,
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  dim: { opacity: 0.8 },

  body: { flex: 1, justifyContent: 'space-between' },
  card: {
    marginHorizontal: SCREEN_GUTTER,
    // Overlaps the hero, as in the design.
    marginTop: -spacing.huge,
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  referenceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  referenceCopy: { flex: 1, gap: spacing.xxs },
  copy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginVertical: spacing.lg,
  },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  fact: { width: '45%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  factIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  factCopy: { flex: 1, gap: spacing.xxs },

  actions: { gap: spacing.md, paddingHorizontal: SCREEN_GUTTER, paddingTop: spacing.lg },
});

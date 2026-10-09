import React, { memo, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText, Icon, SheetModal } from '../../../components/ui';
import { colors, radii, spacing } from '../../../theme';
import type { DeliverySlot } from '../basketSlice';

export type DeliveryTimeSheetProps = {
  visible: boolean;
  /** The merchant's standard window, shown against the "as soon as possible" option. */
  standardLabel: string;
  value: DeliverySlot;
  onChange: (slot: DeliverySlot) => void;
  onClose: () => void;
};

/** Half-hour slots from the next full half hour until closing-ish. */
function buildSlots(): { label: string; detail: string }[] {
  const now = new Date();
  const start = new Date(now);
  start.setMinutes(now.getMinutes() > 30 ? 60 : 30, 0, 0);
  // An hour's lead time: a kitchen cannot take a slot that is already here.
  start.setHours(start.getHours() + 1);

  return Array.from({ length: 8 }, (_, index) => {
    const from = new Date(start.getTime() + index * 30 * 60_000);
    const to = new Date(from.getTime() + 30 * 60_000);
    const hhmm = (d: Date) =>
      `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return {
      label: `${hhmm(from)} – ${hhmm(to)}`,
      detail: from.getDate() === now.getDate() ? 'Today' : 'Tomorrow',
    };
  });
}

/**
 * Picks when the order should arrive.
 *
 * "As soon as possible" is an option in the same list rather than a separate
 * control, because it is one answer to the same question — splitting it out
 * would make choosing a time feel like leaving the normal path.
 */
function DeliveryTimeSheetBase({
  visible,
  standardLabel,
  value,
  onChange,
  onClose,
}: DeliveryTimeSheetProps) {
  const slots = useMemo(buildSlots, [visible]);

  const choose = (slot: DeliverySlot) => {
    onChange(slot);
    onClose();
  };

  return (
    <SheetModal visible={visible} title="When would you like it?" onClose={onClose}>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        <Option
          label="As soon as possible"
          detail={standardLabel}
          selected={value === null}
          onPress={() => choose(null)}
        />

        <AppText variant="eyebrow" color="textMuted" style={styles.groupLabel}>
          Later today
        </AppText>

        {slots.map(slot => (
          <Option
            key={slot.label}
            label={slot.label}
            detail={slot.detail}
            selected={value?.label === slot.label}
            onPress={() => choose(slot)}
          />
        ))}
      </ScrollView>
    </SheetModal>
  );
}

function Option({
  label,
  detail,
  selected,
  onPress,
}: {
  label: string;
  detail: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
      <View style={styles.copy}>
        <AppText variant="bodyStrong">{label}</AppText>
        <AppText variant="caption" color="textMuted">
          {detail}
        </AppText>
      </View>

      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <Icon name="check" size={13} color={colors.textInverse} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { maxHeight: 420 },
  groupLabel: { marginTop: spacing.lg, marginBottom: spacing.xs },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  copy: { flex: 1, gap: spacing.xxs },
  radio: {
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pressed: { opacity: 0.7 },
});

export const DeliveryTimeSheet = memo(DeliveryTimeSheetBase);

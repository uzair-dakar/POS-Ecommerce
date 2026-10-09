import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, CountBadge, Icon, type IconName } from '../../../components/ui';
import { colors, radii, spacing } from '../../../theme';

export type SettingsRowProps = {
  icon: IconName;
  label: string;
  /** Grey text on the right — the current value, not a description. */
  value?: string;
  badgeCount?: number;
  last?: boolean;
  onPress: () => void;
};

/**
 * One line in a settings group.
 *
 * The icon sits in a tinted square rather than loose on the row: at this size
 * a bare glyph beside text reads as decoration, while a contained one reads as
 * the row's subject and keeps every label starting on the same vertical line
 * however wide the glyph happens to be.
 */
function SettingsRowBase({
  icon,
  label,
  value,
  badgeCount = 0,
  last = false,
  onPress,
}: SettingsRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      onPress={onPress}
      style={({ pressed }) => [styles.row, !last && styles.divided, pressed && styles.pressed]}>
      <View style={styles.glyph}>
        <Icon name={icon} size={17} color={colors.primary} />
      </View>

      <AppText variant="body" style={styles.label} numberOfLines={1}>
        {label}
      </AppText>

      {badgeCount > 0 ? <CountBadge count={badgeCount} tone="danger" bordered={false} /> : null}

      {value ? (
        <AppText variant="caption" color="textMuted" numberOfLines={1} style={styles.value}>
          {value}
        </AppText>
      ) : null}

      <Icon name="chevronRight" size={13} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  divided: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  glyph: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1 },
  value: { maxWidth: 140 },
  pressed: { backgroundColor: colors.surfaceMuted },
});

export const SettingsRow = memo(SettingsRowBase);

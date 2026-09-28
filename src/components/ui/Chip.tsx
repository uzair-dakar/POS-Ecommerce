import React, { memo } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, spacing } from '../../theme';
import { AppText } from './Text';

export type ChipProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

/** Filter pill — "All / Open now / Fastest / Free delivery". */
function ChipBase({ label, selected = false, disabled, onPress, style }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selected : styles.unselected,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}>
      <AppText variant="captionStrong" color={selected ? 'textInverse' : 'text'}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 38,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  unselected: { backgroundColor: colors.surface, borderColor: colors.border },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.85 },
});

export const Chip = memo(ChipBase);

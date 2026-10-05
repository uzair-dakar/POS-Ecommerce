import React, { memo } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import { AppText } from './Text';
import type { ColorToken } from '../../theme';

/** 'light' sits on the app background; 'dark' on a navy/photographic ground. */
export type ChipTone = 'light' | 'dark';

export type ChipProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  tone?: ChipTone;
  onPress?: () => void;
  style?: ViewStyle;
};

const CONTENT_COLOR: Record<ChipTone, { selected: ColorToken; unselected: ColorToken }> = {
  light: { selected: 'textInverse', unselected: 'text' },
  dark: { selected: 'text', unselected: 'textInverse' },
};

/** Filter pill — "All / Open now / Fastest / Free delivery". */
function ChipBase({
  label,
  selected = false,
  disabled,
  tone = 'light',
  onPress,
  style,
}: ChipProps) {
  const color = selected ? CONTENT_COLOR[tone].selected : CONTENT_COLOR[tone].unselected;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !!disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        tone === 'dark'
          ? selected
            ? styles.darkSelected
            : styles.darkUnselected
          : selected
            ? styles.lightSelected
            : styles.lightUnselected,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}>
      <AppText variant="captionStrong" color={color}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 40,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  lightSelected: { backgroundColor: colors.primary, borderColor: colors.primary, ...shadows.card },
  lightUnselected: { backgroundColor: colors.surface, borderColor: colors.border },
  darkSelected: { backgroundColor: colors.surface, borderColor: colors.surface },
  darkUnselected: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
});

export const Chip = memo(ChipBase);

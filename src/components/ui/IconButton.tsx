import React, { memo } from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { colors, radii, shadows } from '../../theme';
import { Icon, type IconName } from './Icon';

export type IconButtonProps = {
  name: IconName;
  accessibilityLabel: string;
  onPress: () => void;
  /** 'surface' is the white circle over imagery; 'ghost' has no background. */
  variant?: 'surface' | 'ghost' | 'outline';
  size?: number;
  color?: string;
  style?: ViewStyle;
};

/** Circular icon-only control — back buttons, favourites, close. */
function IconButtonBase({
  name,
  accessibilityLabel,
  onPress,
  variant = 'surface',
  size = 44,
  color = colors.text,
  style,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size },
        variant === 'surface' && styles.surface,
        variant === 'outline' && styles.outline,
        pressed && styles.pressed,
        style,
      ]}>
      <Icon name={name} size={size * 0.45} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill },
  surface: { backgroundColor: colors.surface, ...shadows.card },
  outline: { borderWidth: 1.5, borderColor: colors.border },
  pressed: { opacity: 0.8 },
});

export const IconButton = memo(IconButtonBase);

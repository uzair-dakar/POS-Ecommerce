import React, { memo, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radii, spacing } from '../../theme';
import { AppText } from './Text';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconRight?: IconName;
  iconLeft?: IconName;
  fullWidth?: boolean;
  style?: ViewStyle;
};

const HEIGHTS: Record<ButtonSize, number> = { sm: 36, md: 46, lg: 56 };

function ButtonBase({
  label,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled,
  iconRight,
  iconLeft,
  fullWidth = true,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const { container, contentColor } = useMemo(() => {
    switch (variant) {
      case 'secondary':
        return { container: { backgroundColor: colors.primary }, contentColor: 'textInverse' as const };
      case 'outline':
        return {
          container: { backgroundColor: colors.transparent, borderWidth: 1, borderColor: colors.borderStrong },
          contentColor: 'text' as const,
        };
      case 'ghost':
        return { container: { backgroundColor: colors.transparent }, contentColor: 'textAccent' as const };
      default:
        return { container: { backgroundColor: colors.accent }, contentColor: 'textInverse' as const };
    }
  }, [variant]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        container,
        { height: HEIGHTS[size] },
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={colors[contentColor]} />
      ) : (
        <View style={styles.content}>
          {iconLeft ? <Icon name={iconLeft} size={18} color={colors[contentColor]} /> : null}
          <AppText variant="button" color={contentColor}>
            {label}
          </AppText>
          {iconRight ? <Icon name={iconRight} size={18} color={colors[contentColor]} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
  },
  fullWidth: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.45 },
});

export const Button = memo(ButtonBase);

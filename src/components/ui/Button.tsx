import React, { memo, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radii, shadows, spacing } from '../../theme';
import { AppText } from './Text';
import { Icon, type IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Which ground the button sits on. Only the variants that borrow the page's
 * colour — outline and ghost — change with it; a filled primary looks the
 * same either way.
 */
export type ButtonTone = 'light' | 'dark';

export type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: ButtonSize;
  loading?: boolean;
  /** Pushed to the trailing edge — a running total, as on "Add to basket". */
  trailingLabel?: string;
  iconRight?: IconName;
  iconLeft?: IconName;
  fullWidth?: boolean;
  style?: ViewStyle;
};

const HEIGHTS: Record<ButtonSize, number> = { sm: 36, md: 46, lg: 56 };

function ButtonBase({
  label,
  variant = 'primary',
  tone = 'light',
  size = 'lg',
  loading = false,
  trailingLabel,
  disabled,
  iconRight,
  iconLeft,
  fullWidth = true,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const { container, contentColor } = useMemo(() => {
    const onDark = tone === 'dark';

    switch (variant) {
      case 'secondary':
        return {
          container: { backgroundColor: colors.primary, ...shadows.card },
          contentColor: 'textInverse' as const,
        };
      case 'soft':
        // A wash of the accent with dark text — readable on light and dark
        // grounds alike, which a filled accent button is not.
        return {
          container: { backgroundColor: colors.accentSoft },
          contentColor: 'primaryDark' as const,
        };
      case 'outline':
        return {
          container: {
            // On a dark ground the outline is a translucent white wash; the
            // light border and navy label would otherwise vanish into it.
            backgroundColor: onDark ? 'rgba(255, 255, 255, 0.08)' : colors.transparent,
            borderWidth: 1.5,
            borderColor: onDark ? 'rgba(255, 255, 255, 0.35)' : colors.borderStrong,
          },
          contentColor: onDark ? ('textInverse' as const) : ('text' as const),
        };
      case 'ghost':
        return {
          container: { backgroundColor: colors.transparent },
          contentColor: onDark ? ('textInverse' as const) : ('textAccent' as const),
        };
      default:
        return {
          container: { backgroundColor: colors.accent, ...shadows.card },
          contentColor: 'textInverse' as const,
        };
    }
  }, [variant, tone]);

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
        <View style={[styles.content, trailingLabel ? styles.contentSpread : null]}>
          {iconLeft ? <Icon name={iconLeft} size={18} color={colors[contentColor]} /> : null}
          <AppText variant="button" color={contentColor} numberOfLines={1}>
            {label}
          </AppText>
          {trailingLabel ? (
            <AppText variant="price" color={contentColor} style={styles.trailing}>
              {trailingLabel}
            </AppText>
          ) : null}
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
    paddingHorizontal: spacing.xxl,
  },
  fullWidth: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  contentSpread: { alignSelf: 'stretch', justifyContent: 'space-between' },
  trailing: { marginLeft: 'auto' },
  pressed: { opacity: 0.9, transform: [{ scale: 0.975 }] },
  disabled: { opacity: 0.4, shadowOpacity: 0, elevation: 0 },
});

export const Button = memo(ButtonBase);

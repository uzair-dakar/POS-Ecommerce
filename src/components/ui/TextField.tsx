import React, { forwardRef, useCallback, useState, type ComponentRef } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { colors, radii, spacing, textVariants } from '../../theme';
import { AppText } from './Text';
import { Icon, type IconName } from './Icon';

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  icon?: IconName;
  error?: string;
  /** Guidance shown under the field while it is valid. */
  hint?: string;
  /** Renders a show/hide toggle and starts masked. */
  secure?: boolean;
  /** Fixed text before the input, e.g. a dialling code. */
  prefix?: string;
  containerStyle?: ViewStyle;
};

/** Forwarded so a screen can focus the next field from a return key. */
export type TextFieldRef = ComponentRef<typeof TextInput>;

/**
 * The app's only text input.
 *
 * Owns its focus and visibility state so screens stay declarative, and gives
 * each state a distinct look rather than only a border colour: focus brings the
 * field onto a white surface with an accent ring and tints the leading icon;
 * error swaps the ring and the message; resting sits flush on the page.
 *
 * Focus deliberately does not add a shadow. On Android that means elevation,
 * and changing a view's elevation while it holds the keyboard makes the
 * platform rebuild its layer — which drops focus mid-tap and bounces it to the
 * next field, so the field could never be typed into.
 */
export const TextField = forwardRef<TextFieldRef, TextFieldProps>(function TextFieldBase(
  {
    label,
    icon,
    error,
    hint,
    secure = false,
    prefix,
    containerStyle,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);
  const [isMasked, setIsMasked] = useState(secure);

  const handleFocus = useCallback<NonNullable<TextInputProps['onFocus']>>(
    event => {
      setIsFocused(true);
      onFocus?.(event);
    },
    [onFocus],
  );

  const handleBlur = useCallback<NonNullable<TextInputProps['onBlur']>>(
    event => {
      setIsFocused(false);
      onBlur?.(event);
    },
    [onBlur],
  );

  const toggleMask = useCallback(() => setIsMasked(current => !current), []);

  const hasError = !!error;
  const iconColor = hasError
    ? colors.danger
    : isFocused
      ? colors.accentPressed
      : colors.textSubtle;

  return (
    <View style={containerStyle}>
      {label ? (
        <AppText variant="label" color={hasError ? 'danger' : 'textMuted'} style={styles.label}>
          {label}
        </AppText>
      ) : null}

      <View
        style={[
          styles.field,
          isFocused && styles.fieldFocused,
          hasError && styles.fieldError,
        ]}>
        {icon ? <Icon name={icon} size={19} color={iconColor} /> : null}

        {prefix ? (
          <>
            <AppText variant="bodyStrong" color="textMuted">
              {prefix}
            </AppText>
            <View style={styles.prefixDivider} />
          </>
        ) : null}

        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={colors.textSubtle}
          secureTextEntry={isMasked}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={label}
          selectionColor={colors.accent}
          cursorColor={colors.accent}
          underlineColorAndroid="transparent"
          {...rest}
        />

        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isMasked ? 'Show password' : 'Hide password'}
            hitSlop={10}
            onPress={toggleMask}
            style={({ pressed }) => pressed && styles.pressed}>
            <Icon name={isMasked ? 'eye' : 'eyeOff'} size={19} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={styles.message}>
          <Icon name="close" size={12} color={colors.danger} />
          <AppText variant="caption" color="danger" style={styles.messageText}>
            {error}
          </AppText>
        </View>
      ) : hint ? (
        <AppText variant="caption" color="textSubtle" style={styles.hint}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  label: { marginBottom: spacing.sm, marginLeft: spacing.xxs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  // Focus lifts the field off the page rather than only recolouring its edge.
  fieldFocused: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  fieldError: { borderColor: colors.danger, backgroundColor: colors.dangerSurface },
  prefixDivider: {
    width: 1,
    height: 24,
    marginLeft: -spacing.xs,
    backgroundColor: colors.borderStrong,
  },
  input: { flex: 1, paddingVertical: spacing.md, color: colors.text, ...textVariants.body },
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginLeft: spacing.xxs,
  },
  messageText: { flex: 1 },
  hint: { marginTop: spacing.sm, marginLeft: spacing.xxs },
  pressed: { opacity: 0.6 },
});

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
  /** Renders a show/hide toggle and starts masked. */
  secure?: boolean;
  /** Fixed text before the input, e.g. a dialling code. */
  prefix?: string;
  containerStyle?: ViewStyle;
};

/**
 * The app's only text input. Owns its focus and visibility state so screens
 * stay declarative, and mirrors the design's three states: resting, focused
 * (accent ring) and error (red ring + message).
 */
/** Forwarded so a screen can focus the next field from a return key. */
export type TextFieldRef = ComponentRef<typeof TextInput>;

export const TextField = forwardRef<TextFieldRef, TextFieldProps>(function TextFieldBase(
  { label, icon, error, secure = false, prefix, containerStyle, onFocus, onBlur, ...rest },
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

  return (
    <View style={containerStyle}>
      {label ? (
        <AppText variant="captionStrong" color="primaryMuted" style={styles.label}>
          {label}
        </AppText>
      ) : null}

      <View
        style={[
          styles.field,
          isFocused && styles.fieldFocused,
          !!error && styles.fieldError,
        ]}>
        {icon ? <Icon name={icon} size={18} color={colors.textSubtle} /> : null}

        {prefix ? (
          <>
            <AppText variant="bodyStrong">{prefix}</AppText>
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
          {...rest}
        />

        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isMasked ? 'Show password' : 'Hide password'}
            hitSlop={spacing.sm}
            onPress={toggleMask}>
            <Icon name={isMasked ? 'eye' : 'eyeOff'} size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <AppText variant="caption" color="danger" style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  label: { marginBottom: spacing.xs },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 54,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  fieldFocused: { borderColor: colors.accent },
  fieldError: { borderColor: colors.danger },
  prefixDivider: {
    width: 1,
    height: 22,
    marginLeft: -spacing.xs,
    backgroundColor: colors.border,
  },
  input: { flex: 1, padding: 0, color: colors.text, ...textVariants.body },
  error: { marginTop: spacing.xs },
});

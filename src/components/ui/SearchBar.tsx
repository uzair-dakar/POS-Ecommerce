import React, { memo } from 'react';
import { Pressable, StyleSheet, TextInput, View, ViewStyle } from 'react-native';
import { colors, radii, spacing, textVariants } from '../../theme';
import { AppText } from './Text';
import { Icon } from './Icon';

export type SearchBarProps = {
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  /**
   * Makes the bar a button that opens the real search screen instead of an
   * input. Mutually exclusive with `onChangeText`.
   */
  onPress?: () => void;
  autoFocus?: boolean;
  style?: ViewStyle;
};

function SearchBarBase({
  placeholder,
  value,
  onChangeText,
  onPress,
  autoFocus,
  style,
}: SearchBarProps) {
  // A display-only bar is a real button, not a disabled TextInput: Android
  // does not deliver press events to a non-editable input, so tapping one
  // silently does nothing.
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="search"
        accessibilityLabel={placeholder}
        onPress={onPress}
        style={({ pressed }) => [styles.wrapper, pressed && styles.pressed, style]}>
        <Icon name="search" size={18} color={colors.textSubtle} />
        <AppText variant="body" color="textSubtle" numberOfLines={1} style={styles.flex}>
          {placeholder}
        </AppText>
      </Pressable>
    );
  }

  return (
    <View style={[styles.wrapper, style]}>
      <Icon name="search" size={18} color={colors.textSubtle} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel={placeholder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 46,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
  },
  flex: { flex: 1 },
  input: { flex: 1, padding: 0, color: colors.text, ...textVariants.body },
  pressed: { opacity: 0.8 },
});

export const SearchBar = memo(SearchBarBase);

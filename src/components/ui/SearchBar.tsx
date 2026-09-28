import React, { memo } from 'react';
import { StyleSheet, TextInput, View, ViewStyle } from 'react-native';
import { colors, radii, spacing, textVariants } from '../../theme';
import { Icon } from './Icon';

export type SearchBarProps = {
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  /** Renders a non-editable bar that navigates to the real search screen. */
  onPress?: () => void;
  style?: ViewStyle;
};

function SearchBarBase({ placeholder, value, onChangeText, onPress, style }: SearchBarProps) {
  return (
    <View style={[styles.wrapper, style]}>
      <Icon name="search" size={18} color={colors.textSubtle} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        value={value}
        onChangeText={onChangeText}
        editable={!onPress}
        onPressIn={onPress}
        returnKeyType="search"
        accessibilityRole="search"
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
  input: { flex: 1, padding: 0, color: colors.text, ...textVariants.body },
});

export const SearchBar = memo(SearchBarBase);

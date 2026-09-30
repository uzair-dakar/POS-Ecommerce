import React, { memo, useCallback, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '../../theme';
import { Icon } from './Icon';

export type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Tappable label — accepts rich content, e.g. an inline "Terms" link. */
  children: ReactNode;
  accessibilityLabel: string;
};

function CheckboxBase({ checked, onChange, children, accessibilityLabel }: CheckboxProps) {
  const toggle = useCallback(() => onChange(!checked), [checked, onChange]);

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel}
      onPress={toggle}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Icon name="check" size={14} color={colors.textInverse} strokeWidth={3} /> : null}
      </View>
      <View style={styles.label}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  box: {
    width: 26,
    height: 26,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { backgroundColor: colors.accent, borderColor: colors.accent },
  label: { flex: 1 },
  pressed: { opacity: 0.8 },
});

export const Checkbox = memo(CheckboxBase);

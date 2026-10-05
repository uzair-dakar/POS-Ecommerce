import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radii, spacing } from '../../theme';
import { AppText } from './Text';
import { Icon } from './Icon';

export type QuantityStepperProps = {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  compact?: boolean;
};

/** −  2  +  control used in the basket and on grocery tiles. */
function QuantityStepperBase({
  quantity,
  onIncrement,
  onDecrement,
  min = 0,
  max = 99,
  compact = false,
}: QuantityStepperProps) {
  const size = compact ? 32 : 40;
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        disabled={quantity <= min}
        onPress={onDecrement}
        style={({ pressed }) => [
          styles.button,
          styles.minus,
          { width: size, height: size },
          quantity <= min && styles.disabled,
          pressed && styles.pressed,
        ]}>
        <Icon name="minus" size={16} color={colors.text} />
      </Pressable>

      <AppText variant="bodyStrong" style={styles.value}>
        {quantity}
      </AppText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        disabled={quantity >= max}
        onPress={onIncrement}
        style={({ pressed }) => [
          styles.button,
          styles.plus,
          { width: size, height: size },
          quantity >= max && styles.disabled,
          pressed && styles.pressed,
        ]}>
        <Icon name="plus" size={16} color={colors.textInverse} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  button: { alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill },
  minus: { backgroundColor: colors.surfaceMuted },
  plus: { backgroundColor: colors.primary },
  value: { minWidth: 22, textAlign: 'center' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.92 }] },
});

export const QuantityStepper = memo(QuantityStepperBase);

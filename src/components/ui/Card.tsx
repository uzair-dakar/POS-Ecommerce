import React, { memo } from 'react';
import { Pressable, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { colors, radii, shadows, spacing, type RadiusToken, type ShadowToken } from '../../theme';

export type CardProps = ViewProps & {
  radius?: RadiusToken;
  elevation?: ShadowToken;
  padded?: boolean;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
};

/** Surface primitive. Becomes pressable only when `onPress` is given. */
function CardBase({
  radius = 'lg',
  elevation = 'card',
  padded = true,
  onPress,
  style,
  children,
  ...rest
}: CardProps) {
  const base = [
    styles.card,
    { borderRadius: radii[radius] },
    shadows[elevation],
    padded && styles.padded,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [base, pressed && styles.pressed]}>
        {children}
      </Pressable>
    );
  }

  return (
    <View style={base} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, overflow: 'hidden' },
  padded: { padding: spacing.lg },
  pressed: { opacity: 0.9 },
});

export const Card = memo(CardBase);

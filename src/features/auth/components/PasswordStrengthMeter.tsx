import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/ui';
import { colors, radii, spacing } from '../../../theme';
import { PASSWORD_STRENGTH_LABELS, scorePassword } from '../../../utils/validation';

const SEGMENTS = [0, 1, 2, 3] as const;

/** Four bars that fill as the password gets stronger. */
function PasswordStrengthMeterBase({ password }: { password: string }) {
  const score = useMemo(() => scorePassword(password), [password]);
  const label = PASSWORD_STRENGTH_LABELS[score];

  // Below "good" the bars stay amber, so the colour itself carries the advice.
  const fillColor = score >= 3 ? colors.success : colors.accent;

  return (
    <View
      accessible
      accessibilityLabel={label || 'Password strength'}
      style={styles.wrapper}>
      <View style={styles.bars}>
        {SEGMENTS.map(index => (
          <View
            key={index}
            style={[
              styles.segment,
              { backgroundColor: index < score ? fillColor : colors.border },
            ]}
          />
        ))}
      </View>

      {label ? (
        <AppText variant="caption" color={score >= 3 ? 'success' : 'textMuted'}>
          {label}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  bars: { flexDirection: 'row', gap: spacing.xs },
  segment: { flex: 1, height: 4, borderRadius: radii.pill },
});

export const PasswordStrengthMeter = memo(PasswordStrengthMeterBase);

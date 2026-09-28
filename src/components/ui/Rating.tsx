import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../../theme';
import { AppText } from './Text';
import { Icon } from './Icon';

/** Star + score, e.g. "★ 9.4". */
function RatingBase({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <View style={styles.row}>
      <Icon name="star" size={size} color={colors.accentBright} filled />
      <AppText variant="captionStrong">{value.toFixed(1)}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});

export const Rating = memo(RatingBase);

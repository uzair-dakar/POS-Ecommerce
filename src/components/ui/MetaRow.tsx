import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../../theme';
import { AppText } from './Text';
import { Icon, type IconName } from './Icon';

export type MetaItem = { icon?: IconName; label: string };

/** "🚲 Free · 🕐 25-40 min · ★ 4.5" strip used on every store card. */
function MetaRowBase({ items }: { items: MetaItem[] }) {
  return (
    <View style={styles.row}>
      {items.map((item, index) => (
        <View key={item.label} style={styles.item}>
          {index > 0 ? <AppText variant="caption" color="textSubtle">·</AppText> : null}
          {item.icon ? <Icon name={item.icon} size={13} color={colors.primaryMuted} /> : null}
          <AppText variant="caption" color="textMuted">
            {item.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});

export const MetaRow = memo(MetaRowBase);

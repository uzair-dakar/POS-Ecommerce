import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SCREEN_GUTTER, spacing } from '../../theme';
import { AppText } from './Text';

export type SectionHeaderProps = {
  title: string;
  eyebrow?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

/** "CURATED FOR YOU / Brands you love ........ See all" */
function SectionHeaderBase({ title, eyebrow, actionLabel, onActionPress }: SectionHeaderProps) {
  return (
    <View style={styles.wrapper}>
      {eyebrow ? (
        <AppText variant="eyebrow" color="textAccent">
          {eyebrow}
        </AppText>
      ) : null}
      <View style={styles.row}>
        <AppText variant="h2" style={styles.title}>
          {title}
        </AppText>
        {actionLabel && onActionPress ? (
          <Pressable accessibilityRole="button" onPress={onActionPress} hitSlop={spacing.sm}>
            <AppText variant="captionStrong" color="primaryMuted">
              {actionLabel}
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: SCREEN_GUTTER, gap: spacing.xxs, marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  title: { flexShrink: 1 },
});

export const SectionHeader = memo(SectionHeaderBase);

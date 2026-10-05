import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radii, SCREEN_GUTTER, spacing } from '../../theme';
import { AppText } from './Text';
import { Icon } from './Icon';

export type SectionHeaderProps = {
  title: string;
  eyebrow?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

/** "CURATED FOR YOU / Brands you love ........ See all ›" */
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${actionLabel}, ${title}`}
            onPress={onActionPress}
            hitSlop={10}
            // A bare word does not read as tappable; the pill and chevron do.
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
            <AppText variant="label" color="primaryMuted">
              {actionLabel}
            </AppText>
            <Icon name="chevronRight" size={11} color={colors.primaryMuted} strokeWidth={2.6} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: SCREEN_GUTTER, gap: spacing.xs, marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: { flexShrink: 1 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },
  pressed: { opacity: 0.7 },
});

export const SectionHeader = memo(SectionHeaderBase);

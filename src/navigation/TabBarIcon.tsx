import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon, type IconName } from '../components/ui';
import { colors, radii, spacing } from '../theme';

/**
 * The active tab is a filled navy pill around the glyph (the label sits
 * below it in the tab bar). Drawn here rather than via
 * `tabBarActiveBackgroundColor`, which paints the whole square item slot.
 */
function TabBarIconBase({ name, focused }: { name: IconName; focused: boolean }) {
  return (
    <View style={[styles.pill, focused && styles.pillActive]}>
      <Icon
        name={name}
        size={21}
        filled={focused}
        color={focused ? colors.textInverse : colors.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    minWidth: 54,
    height: 34,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: { backgroundColor: colors.primary },
});

export const TabBarIcon = memo(TabBarIconBase);

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../ui';
import { spacing } from '../../theme';
import { Screen } from './Screen';

/**
 * Stand-in for screens that are designed but not built yet. Keeps navigation
 * wiring honest end-to-end; delete each usage as the real screen lands.
 */
export function PlaceholderScreen({ title, note }: { title: string; note?: string }) {
  return (
    <Screen gutter>
      <View style={styles.centered}>
        <AppText variant="h2" align="center">
          {title}
        </AppText>
        <AppText variant="body" color="textMuted" align="center">
          {note ?? 'This screen is next up.'}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
});

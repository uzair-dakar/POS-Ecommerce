import React, { memo, type PropsWithChildren } from 'react';
import { StatusBar, StyleSheet, View, ViewStyle } from 'react-native';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';
import { colors, SCREEN_GUTTER } from '../../theme';
import type { ColorToken } from '../../theme';

export type ScreenProps = PropsWithChildren<{
  /** Which safe-area edges to inset. Feeds usually skip 'bottom' (tab bar). */
  edges?: readonly Edge[];
  background?: ColorToken;
  /** Adds the standard horizontal page gutter. Off for full-bleed feeds. */
  gutter?: boolean;
  statusBarStyle?: 'light-content' | 'dark-content';
  style?: ViewStyle;
}>;

/** Every screen's outermost element — safe area, background and gutter in one place. */
function ScreenBase({
  children,
  edges = ['top'],
  background = 'background',
  gutter = false,
  statusBarStyle = 'dark-content',
  style,
}: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: colors[background] }]}>
      <StatusBar barStyle={statusBarStyle} />
      <View style={[styles.flex, gutter && styles.gutter, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gutter: { paddingHorizontal: SCREEN_GUTTER },
});

export const Screen = memo(ScreenBase);

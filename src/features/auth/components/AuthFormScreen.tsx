import React, { memo, type PropsWithChildren, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { useFooterInset } from '../../../hooks/useFooterInset';
import { Screen } from '../../../components/layout';
import { colors, SCREEN_GUTTER, spacing } from '../../../theme';

export type AuthFormScreenProps = PropsWithChildren<{
  /** Pinned to the bottom above the keyboard — the primary action lives here. */
  footer: ReactNode;
}>;

/**
 * Shared shell for the auth forms.
 *
 * The form scrolls while the submit button stays pinned to the bottom, and
 * the whole thing lifts above the keyboard — so on a short phone the user can
 * always reach both the field they are typing in and the button.
 */
function AuthFormScreenBase({ children, footer }: AuthFormScreenProps) {
  const footerInset = useFooterInset();

  return (
    <Screen edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: 'padding', default: undefined })}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>

        <View
          style={[styles.footer, { paddingBottom: footerInset }]}>
          {footer}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: SCREEN_GUTTER,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  footer: {
    gap: spacing.sm,
    paddingHorizontal: SCREEN_GUTTER,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
  },
});

export const AuthFormScreen = memo(AuthFormScreenBase);

import React, { type ReactElement, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, Button } from '../ui';
import { spacing } from '../../theme';

export type QueryBoundaryProps<TData> = {
  /**
   * Straight from an RTK Query hook result — spread the whole hook return in.
   * `data` is optional and `refetch` returns a promise-like, so both are typed
   * to match rather than forcing every caller to pick fields apart.
   */
  data?: TData;
  isLoading: boolean;
  isError: boolean;
  refetch: () => unknown;
  /** Shown while loading — a skeleton shaped like the real content. */
  skeleton?: ReactNode;
  errorTitle?: string;
  children: (data: TData) => ReactElement | null;
};

/**
 * The one place loading and error states are handled.
 *
 * Every screen that reads from the API wraps its content in this, so the
 * three states look and behave identically everywhere and no screen can
 * forget the error path. The render prop means `children` only ever sees
 * defined data — no optional chaining through the whole tree.
 */
export function QueryBoundary<TData>({
  data,
  isLoading,
  isError,
  refetch,
  skeleton,
  errorTitle = "We couldn't load this",
  children,
}: QueryBoundaryProps<TData>) {
  if (isLoading) {
    return <>{skeleton ?? null}</>;
  }

  if (isError || !data) {
    return (
      <View style={styles.centered}>
        <AppText variant="h2" align="center">
          {errorTitle}
        </AppText>
        <AppText variant="body" color="textMuted" align="center">
          Check your connection and try again.
        </AppText>
        <Button label="Try again" fullWidth={false} onPress={refetch} />
      </View>
    );
  }

  return children(data);
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
});

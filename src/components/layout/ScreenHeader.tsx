import React, { memo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppText, IconButton } from '../ui';
import { colors, SCREEN_GUTTER, spacing } from '../../theme';

export type ScreenHeaderProps = {
  title?: string;
  subtitle?: string;
  /** Rendered at the trailing edge — usually an IconButton or a text action. */
  action?: ReactNode;
  /** Adds a hairline under the header once content scrolls beneath it. */
  bordered?: boolean;
};

/** Back button, centred title block and one optional trailing action. */
function ScreenHeaderBase({ title, subtitle, action, bordered = false }: ScreenHeaderProps) {
  const navigation = useNavigation();

  return (
    <View style={[styles.wrapper, bordered && styles.bordered]}>
      {navigation.canGoBack() ? (
        <IconButton
          name="arrowLeft"
          accessibilityLabel="Go back"
          variant="outline"
          size={40}
          onPress={navigation.goBack}
        />
      ) : (
        <View style={styles.spacer} />
      )}

      <View style={styles.titleBlock}>
        {title ? (
          <AppText variant="h3" numberOfLines={1} align="center">
            {title}
          </AppText>
        ) : null}
        {subtitle ? (
          <AppText variant="caption" color="textMuted" numberOfLines={1} align="center">
            {subtitle}
          </AppText>
        ) : null}
      </View>

      <View style={styles.action}>{action ?? <View style={styles.spacer} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: SCREEN_GUTTER,
    paddingVertical: spacing.md,
  },
  bordered: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  titleBlock: { flex: 1, alignItems: 'center' },
  action: { minWidth: 40, alignItems: 'flex-end' },
  spacer: { width: 40, height: 40 },
});

export const ScreenHeader = memo(ScreenHeaderBase);

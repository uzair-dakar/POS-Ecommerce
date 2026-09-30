import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppText, IconButton, Wordmark } from '../../../components/ui';
import { spacing } from '../../../theme';

export type AuthHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  showWordmark?: boolean;
};

/** Back button, optional wordmark, then the screen's title block. */
function AuthHeaderBase({ title, subtitle, eyebrow, showWordmark = false }: AuthHeaderProps) {
  const navigation = useNavigation();

  return (
    <View style={styles.wrapper}>
      {navigation.canGoBack() ? (
        <IconButton
          name="arrowLeft"
          accessibilityLabel="Go back"
          variant="outline"
          onPress={navigation.goBack}
        />
      ) : null}

      {showWordmark ? <Wordmark size="md" /> : null}

      <View style={styles.titleBlock}>
        {eyebrow ? (
          <AppText variant="eyebrow" color="textAccent">
            {eyebrow}
          </AppText>
        ) : null}
        <AppText variant="display">{title}</AppText>
        {subtitle ? (
          <AppText variant="body" color="textMuted">
            {subtitle}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.lg, paddingTop: spacing.sm },
  titleBlock: { gap: spacing.xs },
});

export const AuthHeader = memo(AuthHeaderBase);

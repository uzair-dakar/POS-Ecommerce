import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '../../../components/layout';
import { AppText, Button, Card } from '../../../components/ui';
import { colors, radii, SCREEN_GUTTER, spacing } from '../../../theme';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { selectIsGuest, selectUser, signedOut } from '../../auth/authSlice';

/**
 * Minimal for now — the full menu from the design comes with the account
 * feature. What it does own today is the sign-out path, which is what makes
 * the auth flow testable end to end.
 */
export function AccountScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isGuest = useAppSelector(selectIsGuest);

  const handleSignOut = useCallback(() => {
    dispatch(signedOut());
  }, [dispatch]);

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'G';

  return (
    <Screen gutter>
      <View style={styles.content}>
        <Card padded={false} style={styles.profile}>
          <View style={styles.avatar}>
            <AppText variant="h2" color="textInverse">
              {initials}
            </AppText>
          </View>
          <View style={styles.identity}>
            <AppText variant="h2" numberOfLines={1}>
              {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
            </AppText>
            <AppText variant="caption" color="textMuted" numberOfLines={1}>
              {user?.email ?? 'Sign in to save your orders and addresses'}
            </AppText>
          </View>
        </Card>

        <Button
          label={isGuest ? 'Sign in' : 'Log out'}
          variant={isGuest ? 'primary' : 'outline'}
          onPress={handleSignOut}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingTop: spacing.xl, gap: spacing.xl },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, padding: SCREEN_GUTTER },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: { flex: 1, gap: spacing.xxs },
});

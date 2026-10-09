import React, { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen } from '../../../components/layout';
import { AppText, Button, Icon } from '../../../components/ui';
import { colors, radii, SCREEN_GUTTER, shadows, spacing } from '../../../theme';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { useTabBarMetrics } from '../../../navigation/tabBarMetrics';
import { selectIsGuest, selectUser, signedOut } from '../../auth/authSlice';
import { useGetOrdersQuery } from '../../orders/api/ordersApi';
import { isOrderLive } from '../../orders/orderStatus';
import type { RootStackParamList } from '../../../navigation/types';
import { SettingsRow } from '../components/SettingsRow';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

/**
 * The account tab.
 *
 * Grouped rows rather than one long list: the groups are what let someone find
 * a setting by category instead of reading every line, and they separate the
 * things that change an order from the things that change the account.
 *
 * A guest sees the same page with the same groups, not a dead end — the only
 * difference is a prompt at the top, so it is obvious both that the app works
 * without an account and what signing in would add.
 */
export function AccountScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<Navigation>();
  const { clearance } = useTabBarMetrics();

  const user = useAppSelector(selectUser);
  const isGuest = useAppSelector(selectIsGuest);

  const { data: orders } = useGetOrdersQuery();
  const liveOrderCount = useMemo(
    () => (orders ?? []).filter(order => isOrderLive(order.status)).length,
    [orders],
  );

  const handleSignOut = useCallback(() => dispatch(signedOut()), [dispatch]);
  const goToOrders = useCallback(
    () => navigation.navigate('Main', { screen: 'OrdersTab' }),
    [navigation],
  );
  const goToAddresses = useCallback(() => navigation.navigate('Addresses'), [navigation]);
  const notYet = useCallback(() => {}, []);

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'G';

  return (
    <Screen edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: clearance + spacing.xxl }]}
        showsVerticalScrollIndicator={false}>
        <AppText variant="eyebrow" color="textAccent">
          Your account
        </AppText>
        <AppText variant="h1" style={styles.title}>
          {user ? user.firstName : 'Guest'}
        </AppText>

        <View style={styles.profile}>
          <View style={styles.avatar}>
            <AppText variant="h2" color="textInverse">
              {initials}
            </AppText>
          </View>
          <View style={styles.identity}>
            <AppText variant="bodyStrong" numberOfLines={1}>
              {user ? `${user.firstName} ${user.lastName}` : 'Browsing as a guest'}
            </AppText>
            <AppText variant="caption" color="textMuted" numberOfLines={1}>
              {user?.email ?? 'Your basket is saved on this device only'}
            </AppText>
          </View>
        </View>

        {isGuest ? (
          <View style={styles.prompt}>
            <View style={styles.promptCopy}>
              <Icon name="bolt" size={16} color={colors.accentPressed} />
              <AppText variant="captionStrong" color="text" style={styles.promptText}>
                Sign in to keep your orders, addresses and cards on every device.
              </AppText>
            </View>
            <Button label="Sign in" size="md" onPress={handleSignOut} />
          </View>
        ) : null}

        <Group title="Orders & delivery">
          <SettingsRow
            icon="bag"
            label="Your orders"
            badgeCount={liveOrderCount}
            onPress={goToOrders}
          />
          <SettingsRow icon="pin" label="Delivery addresses" onPress={goToAddresses} />
          <SettingsRow icon="card" label="Payment methods" value="Visa ···· 4421" onPress={notYet} />
          <SettingsRow icon="gift" label="Promo codes" last onPress={notYet} />
        </Group>

        <Group title="Preferences">
          <SettingsRow icon="bell" label="Notifications" value="On" onPress={notYet} />
          <SettingsRow icon="heart" label="Favourites" onPress={notYet} />
          <SettingsRow icon="pin" label="Country & language" value="Malta · EN" last onPress={notYet} />
        </Group>

        <Group title="Support">
          <SettingsRow icon="shield" label="Help centre" onPress={notYet} />
          <SettingsRow icon="mail" label="Contact us" onPress={notYet} />
          <SettingsRow icon="lock" label="Privacy & terms" last onPress={notYet} />
        </Group>

        {isGuest ? null : (
          <Button
            label="Log out"
            variant="outline"
            style={styles.signOut}
            onPress={handleSignOut}
          />
        )}

        <AppText variant="caption" color="textMuted" align="center" style={styles.version}>
          Buzztill · v1.0.0
        </AppText>
      </ScrollView>
    </Screen>
  );
}

/** A titled card of rows. The title sits outside the card, as a label for it. */
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <AppText variant="eyebrow" color="textMuted" style={styles.groupTitle}>
        {title}
      </AppText>
      <View style={styles.groupCard}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SCREEN_GUTTER, paddingTop: spacing.sm },
  title: { marginTop: spacing.xxs, marginBottom: spacing.lg },

  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: { flex: 1, gap: spacing.xxs },

  prompt: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: colors.accentSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accentSoft,
  },
  promptCopy: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  promptText: { flex: 1 },

  group: { marginTop: spacing.xl },
  groupTitle: { marginBottom: spacing.sm, marginLeft: spacing.xs },
  groupCard: {
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadows.card,
  },

  signOut: { marginTop: spacing.xl },
  version: { marginTop: spacing.xl },
});

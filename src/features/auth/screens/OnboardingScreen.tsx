import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen } from '../../../components/layout';
import { AppImage, AppText, Button, Chip, Icon, Wordmark } from '../../../components/ui';
import { colors, SCREEN_GUTTER, spacing } from '../../../theme';
import { useAppDispatch } from '../../../store/hooks';
import type { AuthStackParamList } from '../../../navigation/types';
import { guestSessionStarted } from '../authSlice';

type Navigation = NativeStackNavigationProp<AuthStackParamList>;

/** The 2x2 hero collage. Static, so it lives outside the component. */
const COLLAGE = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=70',
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=70',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=500&q=70',
  'https://images.unsplash.com/photo-1487070183336-b863922373d4?auto=format&fit=crop&w=500&q=70',
] as const;

const CATEGORIES = ['Restaurants', 'Groceries', 'Shops'] as const;

export function OnboardingScreen() {
  const navigation = useNavigation<Navigation>();
  const dispatch = useAppDispatch();

  const browseAsGuest = useCallback(() => {
    dispatch(guestSessionStarted());
  }, [dispatch]);

  return (
    <Screen background="primaryDark" statusBarStyle="light-content" edges={['top', 'bottom']}>
      <View style={styles.collage}>
        {COLLAGE.map(uri => (
          <AppImage key={uri} source={{ uri }} style={styles.collageTile} />
        ))}
        <View style={styles.collageScrim} pointerEvents="none" />

        <View style={styles.brand} pointerEvents="none">
          <Wordmark size="lg" />
          <AppText variant="eyebrow" color="textInverse">
            Delivered fresh, every time
          </AppText>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.chips}>
          {CATEGORIES.map(label => (
            <Chip key={label} label={label} tone="dark" />
          ))}
        </View>

        <View style={styles.copy}>
          <AppText variant="display" color="textInverse">
            Your favourites,{'\n'}delivered fresh.
          </AppText>
          <AppText variant="body" color="textInverse" style={styles.subtitle}>
            Order from local restaurants, shop fresh groceries and get it all to your door in
            under 30 minutes.
          </AppText>
        </View>

        <View style={styles.actions}>
          <Button
            label="Create account"
            iconRight="arrowRight"
            onPress={() => navigation.navigate('SignUp')}
          />
          <Button
            label="Sign in"
            variant="outline"
            tone="dark"
            onPress={() => navigation.navigate('SignIn')}
          />

          <Pressable
            accessibilityRole="button"
            onPress={browseAsGuest}
            style={({ pressed }) => [styles.guest, pressed && styles.pressed]}>
            <AppText variant="bodyStrong" color="textInverse">
              Browse as guest
            </AppText>
            <Icon name="chevronRight" size={14} color={colors.textInverse} />
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // A fixed fraction of the screen rather than an aspect ratio, so the grid
  // always spans the full width whatever the device's proportions.
  collage: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', height: '46%' },
  collageTile: { width: '50%', height: '50%' },
  // Sits over the imagery so the wordmark stays legible whatever the photos.
  collageScrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(6, 40, 63, 0.62)' },
  brand: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },

  content: {
    flex: 1,
    paddingHorizontal: SCREEN_GUTTER,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
  },
  chips: { flexDirection: 'row', gap: spacing.sm },

  copy: { gap: spacing.md, paddingVertical: spacing.xl },
  subtitle: { opacity: 0.75 },

  actions: { gap: spacing.md },
  guest: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  pressed: { opacity: 0.7 },
});

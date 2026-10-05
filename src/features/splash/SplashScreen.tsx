import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Screen } from '../../components/layout';
import { AppText, Logo } from '../../components/ui';
import { spacing } from '../../theme';

/**
 * Shown while persisted state rehydrates.
 *
 * It repeats the native launch screen's navy ground and wordmark, so the
 * handover from the OS splash to the app is a fade of the tagline rather than
 * a visible jump. The animation runs on the UI thread, which matters here
 * because the JS thread is busy rehydrating at exactly this moment.
 */
export function SplashScreen() {
  const opacity = useSharedValue(0);
  const lift = useSharedValue(12);

  useEffect(() => {
    const timing = { duration: 420, easing: Easing.out(Easing.quad) };
    opacity.value = withDelay(120, withTiming(1, timing));
    lift.value = withDelay(120, withTiming(0, timing));
  }, [opacity, lift]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: lift.value }],
  }));

  return (
    <Screen background="primaryDark" statusBarStyle="light-content" edges={[]}>
      <View style={styles.centered}>
        <Logo size={104} elevated />
        <Animated.View style={animatedStyle}>
          <AppText variant="eyebrow" color="textInverse">
            Delivered fresh, every time
          </AppText>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
});

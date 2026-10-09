import React, { memo, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { colors, radii, SCREEN_GUTTER, spacing } from '../../theme';
import { AppText } from './Text';
import { Icon } from './Icon';

export type SheetModalProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/**
 * A panel that rises from the bottom over a dimmed page.
 *
 * Used for choices that belong to the screen behind them — picking a delivery
 * time does not take you anywhere, so it should not look like it did. The
 * backdrop is tappable because a sheet with only one way out traps anyone who
 * opened it by accident.
 */
function SheetModalBase({ visible, title, onClose, children }: SheetModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(140)} style={styles.fill}>
        <Pressable accessibilityLabel="Close" style={styles.backdrop} onPress={onClose} />

        <Animated.View
          entering={SlideInDown.springify().damping(20).stiffness(220)}
          exiting={SlideOutDown.duration(180)}
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <View style={styles.grabber} />

          <View style={styles.header}>
            <AppText variant="h2" style={styles.title}>
              {title}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={10}
              onPress={onClose}
              style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
              <Icon name="close" size={15} color={colors.text} />
            </Pressable>
          </View>

          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.overlay },
  sheet: {
    paddingHorizontal: SCREEN_GUTTER,
    paddingTop: spacing.sm,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    backgroundColor: colors.surface,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  title: { flex: 1 },
  close: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
});

export const SheetModal = memo(SheetModalBase);

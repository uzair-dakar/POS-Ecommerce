import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppImage, AppText, Badge, Icon, Rating } from '../../../components/ui';
import { colors, radii, shadows, spacing } from '../../../theme';
import { formatDeliveryWindow } from '../../../utils';
import type { ChainLocation } from '../../../types';

export type LocationRowProps = {
  location: ChainLocation;
  onPress: (location: ChainLocation) => void;
};

/** One branch in a brand's locations list. Closed branches read as disabled. */
function LocationRowBase({ location, onPress }: LocationRowProps) {
  const { merchant, address } = location;
  const handlePress = useCallback(() => onPress(location), [onPress, location]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={merchant.name}
      accessibilityState={{ disabled: !merchant.isOpen }}
      disabled={!merchant.isOpen}
      onPress={handlePress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View>
        <AppImage source={{ uri: merchant.imageUrl }} style={styles.logo} />
        {!merchant.isOpen ? (
          <View style={styles.closedOverlay}>
            <AppText variant="label" color="textInverse">
              Closed
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <AppText variant="h3" color={merchant.isOpen ? 'text' : 'textSubtle'} numberOfLines={1}>
            {merchant.name}
          </AppText>
          {merchant.isOpen ? (
            <Rating value={merchant.rating} />
          ) : (
            <AppText variant="caption" color="textSubtle">
              Opens 9:00 AM
            </AppText>
          )}
        </View>

        <AppText variant="caption" color="textSubtle" numberOfLines={1}>
          {address}
        </AppText>

        {merchant.isOpen ? (
          <View style={styles.metaRow}>
            <View style={styles.time}>
              <Icon name="clock" size={13} color={colors.primaryMuted} />
              <AppText variant="caption" color="primaryMuted">
                {formatDeliveryWindow(merchant.deliveryMinMinutes, merchant.deliveryMaxMinutes)}
              </AppText>
            </View>
            {merchant.offerLabel ? <Badge label={merchant.offerLabel} tone="accent" /> : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  logo: { width: 82, height: 82, borderRadius: radii.md },
  closedOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: radii.md,
    backgroundColor: 'rgba(6, 40, 63, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: spacing.xs, justifyContent: 'center' },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  time: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },
  pressed: { opacity: 0.9 },
});

export const LocationRow = memo(
  LocationRowBase,
  (prev, next) => prev.location === next.location && prev.onPress === next.onPress,
);

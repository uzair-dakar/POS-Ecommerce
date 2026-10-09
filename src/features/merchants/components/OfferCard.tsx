import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, Icon } from '../../../components/ui';
import { colors, radii, shadows, spacing } from '../../../theme';
import type { Offer } from '../../../types';

export const OFFER_CARD_WIDTH = 196;

/** "40% discount on selected items" card in the Deals & benefits row. */
function OfferCardBase({ offer }: { offer: Offer }) {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Icon
          name={offer.kind === 'gift' ? 'gift' : 'percent'}
          size={18}
          color={colors.accentPressed}
        />
      </View>

      <View style={styles.body}>
        <AppText variant="eyebrow" color="textMuted">
          Offer
        </AppText>
        <AppText variant="captionStrong" numberOfLines={2}>
          {offer.title}
        </AppText>
        <AppText variant="caption" color="primaryMuted">
          {offer.detail}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: OFFER_CARD_WIDTH,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.sm + 2,
    borderRadius: radii.lg,
    backgroundColor: colors.accentSurface,
    ...shadows.subtle,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: spacing.xxs },
});

export const OfferCard = memo(OfferCardBase);

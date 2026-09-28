import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppImage, AppText, Badge, Button, Icon } from '../../../components/ui';
import { colors, radii, spacing } from '../../../theme';
import type { Promotion } from '../../../types';

export type HeroPromoCardProps = {
  promotion: Promotion;
  width: number;
  onPress: (promotion: Promotion) => void;
};

/** Full-bleed dark promo banner at the top of the feed. */
function HeroPromoCardBase({ promotion, width, onPress }: HeroPromoCardProps) {
  return (
    <View style={[styles.card, { width }]}>
      <AppImage source={{ uri: promotion.imageUrl }} style={styles.image} />
      <View style={styles.scrim} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <AppText variant="eyebrow" color="textInverse">
            {promotion.eyebrow}
          </AppText>
          <Badge label="Live nearby" tone="solid" />
        </View>

        <AppText variant="h1" color="textInverse">
          {promotion.title}
        </AppText>

        <Button
          label={promotion.ctaLabel}
          size="sm"
          fullWidth={false}
          iconRight="arrowRight"
          style={styles.cta}
          onPress={() => onPress(promotion)}
        />

        {promotion.subtitle ? (
          <View style={styles.subtitleRow}>
            <Icon name="clock" size={13} color={colors.textInverse} />
            <AppText variant="caption" color="textInverse">
              {promotion.subtitle}
            </AppText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 190,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.primaryDark,
  },
  image: { ...StyleSheet.absoluteFill },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(6, 40, 63, 0.72)' },
  content: { flex: 1, padding: spacing.lg, justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cta: { alignSelf: 'flex-start' },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});

export const HeroPromoCard = memo(HeroPromoCardBase);

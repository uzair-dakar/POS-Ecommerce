import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppImage, AppText, Card, Icon } from '../../../components/ui';
import { colors, radii, spacing } from '../../../theme';
import type { Promotion } from '../../../types';

export type QuickPromoCardProps = {
  promotion: Promotion;
  tone: 'accent' | 'surface';
  onPress: (promotion: Promotion) => void;
};

/** The two small side-by-side cards under the hero banner. */
function QuickPromoCardBase({ promotion, tone, onPress }: QuickPromoCardProps) {
  return (
    <Card
      radius="lg"
      elevation="card"
      padded={false}
      onPress={() => onPress(promotion)}
      style={[
        styles.card,
        { backgroundColor: tone === 'accent' ? colors.accentSurface : colors.surface },
      ]}>
      <View style={styles.body}>
        <AppText variant="eyebrow" color="textMuted">
          {promotion.eyebrow}
        </AppText>
        <AppText variant="h3" numberOfLines={2}>
          {promotion.title}
        </AppText>
      </View>

      <View style={styles.footer}>
        <View style={styles.ctaRow}>
          <AppText variant="captionStrong" color="primaryMuted">
            {promotion.ctaLabel}
          </AppText>
          <Icon name="chevronRight" size={12} color={colors.primaryMuted} />
        </View>
        <AppImage source={{ uri: promotion.imageUrl }} style={styles.thumb} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, height: 156, justifyContent: 'space-between', padding: spacing.lg },
  body: { gap: spacing.xs },
  footer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 1 },
  thumb: { width: 54, height: 54, borderRadius: radii.pill },
});

export const QuickPromoCard = memo(QuickPromoCardBase);

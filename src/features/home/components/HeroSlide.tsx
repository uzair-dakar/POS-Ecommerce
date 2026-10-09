import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';

import { AppText, GradientScrim, Icon } from '../../../components/ui';
import { colors, radii, shadows, spacing } from '../../../theme';
import type { Promotion } from '../../../types';

export type HeroSlideProps = {
  promotion: Promotion;
  index: number;
  /** Scroll offset in pixels, shared with the carousel. */
  scrollX: SharedValue<number>;
  /** One page's width — the card plus the gap between cards. */
  pageWidth: number;
  cardWidth: number;
  height: number;
  /** The last slide carries no trailing gap, or the deck overscrolls by one. */
  isLast: boolean;
  onPress: (promotion: Promotion) => void;
};

/**
 * How far the photo drifts against the card as it passes. Enough to read as
 * depth, small enough never to expose an edge — the image is over-sized by
 * twice this amount to pay for it.
 */
const PARALLAX = 26;

/**
 * One banner.
 *
 * The photo moves slower than the card it sits in, so the deck reads as layers
 * rather than a strip of flat pictures, and the card itself settles as it
 * lands. Both are scroll-linked on the UI thread, which is what keeps the
 * motion tied to the finger instead of animating on a timer afterwards.
 */
function HeroSlideBase({
  promotion,
  index,
  scrollX,
  pageWidth,
  cardWidth,
  height,
  isLast,
  onPress,
}: HeroSlideProps) {
  const inputRange = [(index - 1) * pageWidth, index * pageWidth, (index + 1) * pageWidth];

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          scrollX.value,
          inputRange,
          [-PARALLAX, 0, PARALLAX],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const cardStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ scale: interpolate(progress, [0, 1], [0.94, 1]) }],
      opacity: interpolate(progress, [0, 1], [0.6, 1]),
    };
  });

  const content = (
    <>
      <Animated.View style={[styles.imageWrapper, imageStyle]}>
        <FastImage
          source={{ uri: promotion.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </Animated.View>

      <GradientScrim from="bottom" intensity={0.9} />
      <GradientScrim from="left" intensity={0.5} />

      <View style={styles.content}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowDot} />
          <AppText variant="eyebrow" color="accentBright">
            {promotion.eyebrow}
          </AppText>
        </View>

        <AppText variant="h1" color="textInverse" style={styles.title}>
          {promotion.title}
        </AppText>

        <View style={styles.footer}>
          <View style={styles.cta}>
            <AppText variant="captionStrong" color="textInverse">
              {promotion.ctaLabel}
            </AppText>
            <Icon name="arrowRight" size={15} color={colors.textInverse} />
          </View>

          {promotion.subtitle ? (
            <View style={styles.meta}>
              <Icon name="clock" size={13} color={colors.textInverse} />
              <AppText variant="caption" color="textInverse" style={styles.metaText}>
                {promotion.subtitle}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>
    </>
  );

  return (
    <View style={{ width: cardWidth, marginRight: isLast ? 0 : pageWidth - cardWidth }}>
      <Animated.View
        style={[styles.shadowHost, { width: cardWidth, height }, cardStyle]}>
        <View style={[styles.card, { width: cardWidth, height }]}>
          <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${promotion.eyebrow}. ${promotion.title}. ${promotion.ctaLabel}`}
          onPress={() => onPress(promotion)}
          style={({ pressed }) => [styles.press, pressed && styles.pressed]}>
            {content}
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowHost: {
    borderRadius: radii.xxl,
    backgroundColor: colors.primaryDark,
    ...shadows.raised,
  },
  card: {
    borderRadius: radii.xxl,
    overflow: 'hidden',
    backgroundColor: colors.primaryDark,
  },
  press: { flex: 1 },

  // Over-sized and offset so the parallax drift never reveals an edge.
  imageWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -PARALLAX,
    right: -PARALLAX,
  },
  image: { width: '100%', height: '100%' },

  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.accentBright,
  },
  title: { maxWidth: '88%' },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 1,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaText: { opacity: 0.85 },

  pressed: { opacity: 0.94 },
});

export const HeroSlide = memo(HeroSlideBase);

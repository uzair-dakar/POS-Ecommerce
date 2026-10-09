import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { SCREEN_GUTTER, spacing } from '../../../theme';
import type { Promotion } from '../../../types';
import { HeroSlide } from './HeroSlide';
import { HeroPagination } from './HeroPagination';

export type HeroCarouselProps = {
  promotions: readonly Promotion[];
  onPress: (promotion: Promotion) => void;
};

const HEIGHT = 208;
const GAP = spacing.md;

/** How long each banner holds before the deck moves on. */
const DWELL_MS = 5000;

/** Idle time after a touch before the deck starts moving again. */
const RESUME_MS = 2500;

/**
 * The banner deck at the top of the feed.
 *
 * The dwell timer is the progress bar: one shared value both fills the
 * indicator and, on completion, advances the deck. Running them off separate
 * clocks is what makes most carousels drift — the bar finishes a beat before
 * or after the slide actually moves.
 *
 * Touching the deck pauses it, and it resumes only once the user has been
 * still for a moment, so it never slides out from under a finger or while
 * something is being read. That is why there is no play control to press.
 */
function HeroCarouselBase({ promotions, onPress }: HeroCarouselProps) {
  const { width } = useWindowDimensions();
  const cardWidth = width - SCREEN_GUTTER * 2;
  const pageWidth = cardWidth + GAP;
  const count = promotions.length;

  const listRef = useRef<Animated.ScrollView>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const scrollX = useSharedValue(0);
  const progress = useSharedValue(0);
  const trackedIndex = useSharedValue(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollX.value = event.contentOffset.x;

    // Move the indicator with the finger rather than waiting for the deck to
    // settle, but only tell React when the page actually changes.
    const page = Math.round(event.contentOffset.x / pageWidth);
    if (page !== trackedIndex.value) {
      trackedIndex.value = page;
      runOnJS(setActiveIndex)(page);
    }
  });

  const goTo = useCallback(
    (index: number) => {
      listRef.current?.scrollTo({ x: index * pageWidth, animated: true });
    },
    [pageWidth],
  );

  const advance = useCallback(() => {
    setActiveIndex(current => {
      const next = (current + 1) % count;
      goTo(next);
      return next;
    });
  }, [count, goTo]);

  const pause = useCallback(() => {
    clearTimeout(resumeTimer.current);
    setIsPlaying(false);
  }, []);

  const scheduleResume = useCallback(() => {
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setIsPlaying(true), RESUME_MS);
  }, []);

  // One timing drives both the fill and the hand-off to the next slide.
  useEffect(() => {
    cancelAnimation(progress);
    progress.value = 0;

    if (!isPlaying || count < 2) {
      return;
    }

    progress.value = withTiming(
      1,
      { duration: DWELL_MS, easing: Easing.linear },
      finished => {
        if (finished) {
          runOnJS(advance)();
        }
      },
    );
  }, [activeIndex, isPlaying, count, progress, advance]);

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  return (
    <View>
      <Animated.ScrollView
        ref={listRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        // Snapping to the page rather than paging the whole screen is what
        // lets the next card peek at the gutter.
        snapToInterval={pageWidth}
        decelerationRate="fast"
        disableIntervalMomentum
        contentContainerStyle={styles.content}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onTouchStart={pause}
        onTouchEnd={scheduleResume}
        onMomentumScrollEnd={scheduleResume}>
        {promotions.map((promotion, index) => (
          <HeroSlide
            key={promotion.id}
            promotion={promotion}
            index={index}
            scrollX={scrollX}
            pageWidth={pageWidth}
            cardWidth={cardWidth}
            height={HEIGHT}
            isLast={index === count - 1}
            onPress={onPress}
          />
        ))}
      </Animated.ScrollView>

      {count > 1 ? (
        <View style={styles.pagination} pointerEvents="none">
          <HeroPagination count={count} activeIndex={activeIndex} progress={progress} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SCREEN_GUTTER },
  // Inside the banner, clear of the card's rounded corner and its CTA.
  pagination: {
    position: 'absolute',
    right: SCREEN_GUTTER + spacing.xl,
    bottom: spacing.xl,
  },
});

export const HeroCarousel = memo(HeroCarouselBase);

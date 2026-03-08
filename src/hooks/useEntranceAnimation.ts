import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import { isWeb } from '../utils/PlatformUtils';

const ANIMATION_DURATION = 300;
const ANIMATION_STAGGER = 50;
const ENTRANCE_OFFSET_Y = 15;

/**
 * Hook to manage entrance animations for a list of items.
 * Extracts animation logic from HomeScreen to improve maintainability.
 *
 * @param itemCount Number of items to animate
 * @param prefersReducedMotion Whether the user prefers reduced motion
 * @returns { fadeAnims: Animated.Value[], slideAnims: Animated.Value[] }
 */
export const useEntranceAnimation = (
  itemCount: number,
  prefersReducedMotion: boolean,
) => {
  const useNativeDriver = !isWeb;
  // Initialize animation values
  const fadeAnims = useRef(
    [...Array(itemCount)].map(() => new Animated.Value(0)),
  ).current;
  const slideAnims = useRef(
    [...Array(itemCount)].map(() => new Animated.Value(ENTRANCE_OFFSET_Y)),
  ).current;

  useEffect(() => {
    if (prefersReducedMotion || process.env.NODE_ENV === 'test') {
      fadeAnims.forEach((anim) => anim.setValue(1));
      slideAnims.forEach((anim) => anim.setValue(0));
      return;
    }

    const animations = fadeAnims.map((_, i) => {
      return Animated.parallel([
        Animated.timing(fadeAnims[i], {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(slideAnims[i], {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver,
          easing: Easing.out(Easing.cubic),
        }),
      ]);
    });

    Animated.stagger(ANIMATION_STAGGER, animations).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion]); // Re-run only if prefersReducedMotion changes

  return { fadeAnims, slideAnims };
};

export default useEntranceAnimation;

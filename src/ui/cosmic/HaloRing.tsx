/**
 * HaloRing
 * 
 * Timer progress ring and breathing animation component.
 * Uses Reanimated for smooth, performant animations.
 * Respects reduced motion preferences.
 */

import React, { memo, useEffect, useMemo } from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSpring,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeProvider';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { HaloMode, GlowLevel } from './types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface HaloRingProps {
  /** Display mode: progress ring or breathing animation */
  mode: HaloMode;
  /** Progress value 0-1 (for progress mode) */
  progress?: number;
  /** Ring size in pixels */
  size?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Glow intensity */
  glow?: GlowLevel;
  /** Test ID for testing */
  testID?: string;
}

// Animated Circle component for SVG
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Halo Ring Component
 * 
 * Animated ring for:
 * - Progress indication (timers)
 * - Breathing exercises (Anchor mode)
 * 
 * Respects reduced motion preferences.
 * 
 * @example
 * // Progress ring for timer
 * <HaloRing 
 *   mode="progress" 
 *   progress={0.75} 
 *   size={280} 
 *   glow="strong"
 * />
 * 
 * @example
 * // Breathing ring
 * <HaloRing 
 *   mode="breath" 
 *   size={200} 
 *   glow="medium"
 * />
 */
export const HaloRing = memo(function HaloRing({
  mode,
  progress = 0,
  size = 280,
  strokeWidth = 8,
  glow = 'medium',
  testID,
}: HaloRingProps) {
  const { isCosmic } = useTheme();
  const reduceMotion = useReducedMotion();

  // Animation values
  const breathingProgress = useSharedValue(0);
  const progressValue = useSharedValue(0);

  // Ring calculations
  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  const center = useMemo(() => size / 2, [size]);

  // Colors based on theme
  const colors = useMemo(() => {
    if (!isCosmic) {
      return {
        track: 'rgba(255, 255, 255, 0.1)',
        progress: '#8B5CF6',
        glow: '#8B5CF6',
      };
    }

    return {
      track: 'rgba(42, 53, 82, 0.3)', // slate at 30%
      progress: '#8B5CF6', // nebulaViolet
      glow: '#8B5CF6',
    };
  }, [isCosmic]);

  // Progress animation
  useEffect(() => {
    if (mode === 'progress') {
      if (reduceMotion) {
        progressValue.value = progress;
      } else {
        progressValue.value = withSpring(progress, {
          damping: 20,
          stiffness: 100,
        });
      }
    }
  }, [mode, progress, progressValue, reduceMotion]);

  // Breathing animation
  useEffect(() => {
    if (mode === 'breath' && !reduceMotion) {
      // 6 second cycle: 2s inhale, 2s hold, 2s exhale
      breathingProgress.value = withRepeat(
        withTiming(1, {
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
        }),
        -1, // Infinite
        true // Reverse (yoyo)
      );
    } else if (mode === 'breath' && reduceMotion) {
      // Static state for reduced motion
      breathingProgress.value = 0.5;
    }
  }, [mode, breathingProgress, reduceMotion]);

  // Animated progress stroke
  const progressAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progressValue.value),
  }));

  // Breathing animated styles for outer ring
  const breathingAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      breathingProgress.value,
      [0, 1],
      [1, 1.1],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      breathingProgress.value,
      [0, 0.5, 1],
      [0.5, 1, 0.5],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Inner ring style (inverse of outer for "hold" visualization)
  const innerAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      breathingProgress.value,
      [0, 1],
      [1.05, 0.95],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      breathingProgress.value,
      [0, 0.5, 1],
      [0.3, 0.6, 0.3],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Glow shadow style
  const glowStyle = useMemo((): ViewStyle => {
    if (!isCosmic || glow === 'none') return {};

    const glowIntensity = {
      soft: '40',
      medium: '80',
      strong: '',
    }[glow];

    const glowColor = colors.glow + glowIntensity;

    return Platform.select({
      web: {
        filter: `drop-shadow(0 0 ${glow === 'soft' ? 8 : glow === 'medium' ? 16 : 32}px ${glowColor})`,
      },
      default: {
        shadowColor: colors.glow,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: glow === 'soft' ? 0.25 : glow === 'medium' ? 0.5 : 0.8,
        shadowRadius: glow === 'soft' ? 8 : glow === 'medium' ? 16 : 32,
      },
    }) as ViewStyle;
  }, [isCosmic, glow, colors.glow]);

  if (mode === 'progress') {
    return (
      <View 
        testID={testID}
        style={[styles.container, { width: size, height: size }, glowStyle]}
      >
        <Svg width={size} height={size} style={styles.svg}>
          {/* Background track */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.track}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress arc */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.progress}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={progressAnimatedProps}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>
      </View>
    );
  }

  // Breathing mode
  return (
    <View 
      testID={testID}
      style={[styles.container, { width: size, height: size }]}
    >
      {/* Outer breathing ring */}
      <Animated.View
        style={[
          styles.breathRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: colors.progress,
          },
          breathingAnimatedStyle,
          glowStyle,
        ]}
      />
      
      {/* Inner breathing ring */}
      <Animated.View
        style={[
          styles.breathRing,
          {
            width: size * 0.7,
            height: size * 0.7,
            borderRadius: (size * 0.7) / 2,
            borderWidth: strokeWidth * 0.5,
            borderColor: colors.progress,
            position: 'absolute',
            top: size * 0.15,
            left: size * 0.15,
          },
          innerAnimatedStyle,
        ]}
      />
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  breathRing: {
    position: 'absolute',
    borderStyle: 'solid',
  },
});

export default HaloRing;

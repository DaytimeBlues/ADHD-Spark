/**
 * HaloRing
 * 
 * Timer progress ring and breathing animation component.
 * Uses Reanimated for smooth, performant animations.
 * Respects reduced motion preferences.
 * 
 * Per research spec:
 * - Web: CSS conic-gradient for progress mode (better performance)
 * - Native: lightweight border-ring fallback
 * - Breathing: Scale animation with Reanimated
 */

import React, { memo, useEffect, useMemo } from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  interpolate,
  Extrapolate,
  ReduceMotion,
} from 'react-native-reanimated';
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
 * Web progress mode uses CSS conic-gradient per research spec.
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
  const { isCosmic, t } = useTheme();
  const reduceMotion = useReducedMotion();
  const isWeb = Platform.OS === 'web';

  // Animation values
  const breathingProgress = useSharedValue(0);

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
      track: 'rgba(185, 194, 217, 0.16)', // slate border color per spec
      progress: '#8B5CF6', // nebulaViolet
      glow: '#8B5CF6',
    };
  }, [isCosmic]);

  // Clamp progress to 0-1
  const t01 = Math.max(0, Math.min(1, progress));
  const deg = Math.round(t01 * 360);

  // Breathing animation per spec: 4200ms cycle
  useEffect(() => {
    if (mode !== 'breath') return;
    
    if (reduceMotion) {
      breathingProgress.value = 1;
      return;
    }
    
    // Per research spec: breathCycle 4200ms
    const breathDuration = (t as any).motion?.durations?.breathCycle ?? 4200;
    
    breathingProgress.value = withRepeat(
      withTiming(1.06, {
        duration: breathDuration,
        easing: Easing.inOut(Easing.cubic),
        reduceMotion: ReduceMotion.System,
      }),
      -1, // Infinite
      true // Reverse (yoyo)
    );
  }, [mode, reduceMotion, breathingProgress, t]);

  // Breathing animated styles
  const breathingAnimatedStyle = useAnimatedStyle(() => {
    if (mode !== 'breath') return {};
    
    const scale = breathingProgress.value;
    const opacity = interpolate(
      breathingProgress.value,
      [1, 1.06],
      [0.5, 1],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Inner ring breathing (inverse phase)
  const innerAnimatedStyle = useAnimatedStyle(() => {
    if (mode !== 'breath') return {};
    
    const scale = interpolate(
      breathingProgress.value,
      [1, 1.06],
      [1.03, 0.97],
      Extrapolate.CLAMP
    );
    
    const opacity = interpolate(
      breathingProgress.value,
      [1, 1.06],
      [0.3, 0.6],
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

    const glowColor = colors.glow;
    const glowOpacity = {
      soft: 0.12,
      medium: 0.22,
      strong: 0.28,
    }[glow];
    
    const glowRadius = {
      soft: 10,
      medium: 16,
      strong: 22,
    }[glow];

    return Platform.select({
      web: {
        filter: `drop-shadow(0 0 ${glowRadius}px ${glowColor}${Math.round(glowOpacity * 255).toString(16).padStart(2, '0')})`,
      },
      default: {
        shadowColor: glowColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: glowOpacity,
        shadowRadius: glowRadius,
      },
    }) as ViewStyle;
  }, [isCosmic, glow, colors.glow]);

  // Web progress mode: conic-gradient per research spec
  if (mode === 'progress' && isWeb) {
    const nebulaViolet = (t as any).colors?.cosmic?.nebulaViolet ?? '#8B5CF6';
    const trackColor = colors.track;
    
    const webProgressStyle: ViewStyle = {
      backgroundImage: `conic-gradient(${nebulaViolet} 0deg ${deg}deg, ${trackColor} ${deg}deg 360deg)`,
    } as any;

    const innerSize = size - strokeWidth * 2;

    return (
      <View 
        testID={testID}
        style={[styles.container, { width: size, height: size }, glowStyle]}
      >
        <View
          style={[
            styles.ring,
            { 
              width: size, 
              height: size, 
              borderRadius: size / 2,
              padding: strokeWidth,
            },
            webProgressStyle,
          ]}
        >
          {/* Inner cutout for ring effect */}
          <View
            style={[
              styles.inner,
              {
                width: innerSize,
                height: innerSize,
                borderRadius: innerSize / 2,
                backgroundColor: 'rgba(7, 7, 18, 0.62)',
              },
            ]}
          />
        </View>
      </View>
    );
  }

  // Native progress mode or breathing mode
  if (mode === 'progress') {
    // Native: Use simple border ring
    return (
      <View 
        testID={testID}
        style={[styles.container, { width: size, height: size }, glowStyle]}
      >
        <View
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: colors.track,
            },
          ]}
        >
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                borderRadius: size / 2,
                borderWidth: strokeWidth,
                borderColor: colors.progress,
                borderTopColor: 'transparent',
                borderRightColor: 'transparent',
                transform: [{ rotate: `${-90 + deg}deg` }],
              },
            ]}
          />
        </View>
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
          styles.ring,
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
          styles.ring,
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
  ring: {
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'solid',
  },
  inner: {
    borderStyle: 'solid',
  },
});

export default HaloRing;

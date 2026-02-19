/**
 * Cosmic Motion Tokens
 * 
 * Animation timing and easing for the Cosmic theme
 * Respectful of reduced motion preferences
 */

import { Easing } from 'react-native-reanimated';

// ============================================================================
// DURATION TOKENS (in milliseconds)
// ============================================================================

export const cosmicDurations = {
  // Micro-interactions
  press: 100,        // 80-120ms range - button presses
  hover: 150,        // 120-180ms range - hover states
  
  // Standard transitions
  base: 200,         // Default transition
  enter: 300,        // Element entrance
  exit: 250,         // Element exit
  
  // Screen transitions
  screen: 400,       // 320-480ms range - screen transitions
  
  // Ambient animations
  breathing: 6000,   // 4-6s range - breathing exercises
  pulse: 2000,       // Subtle ambient pulse
  glow: 3000,        // Glow intensity shift
} as const;

// ============================================================================
// EASING CURVES
// ============================================================================

export const cosmicEasings = {
  // Standard
  linear: Easing.linear,
  
  // Entrance (deceleration)
  easeOut: Easing.out(Easing.ease),
  easeOutCubic: Easing.out(Easing.cubic),
  easeOutQuart: Easing.out(Easing.poly(4)),
  
  // Exit (acceleration)
  easeIn: Easing.in(Easing.ease),
  easeInCubic: Easing.in(Easing.cubic),
  
  // Both (for symmetric animations like breathing)
  easeInOut: Easing.inOut(Easing.ease),
  easeInOutSine: Easing.inOut(Easing.sin),
  easeInOutCubic: Easing.inOut(Easing.cubic),
  
  // Spring-like (for playful interactions)
  spring: Easing.elastic(0.7),
  bounce: Easing.bounce,
} as const;

// ============================================================================
// SCALE VALUES
// ============================================================================

export const cosmicScales = {
  press: 0.98,       // Button press scale
  hover: 1.02,       // Hover scale
  pop: 1.05,         // Success/pop scale
  breathIn: 1.1,     // Breathing inhale
  breathOut: 1.0,    // Breathing exhale
} as const;

// ============================================================================
// OPACITY VALUES
// ============================================================================

export const cosmicOpacities = {
  disabled: 0.4,
  pressed: 0.8,
  hover: 0.9,
  subtle: 0.6,
  ghost: 0.3,
} as const;

// ============================================================================
// ANIMATION PRESETS (for Reanimated withReducedMotion)
// ============================================================================

export const cosmicPresets = {
  // Button press
  press: {
    duration: cosmicDurations.press,
    easing: cosmicEasings.easeOut,
  },
  
  // Fade in
  fadeIn: {
    duration: cosmicDurations.enter,
    easing: cosmicEasings.easeOut,
  },
  
  // Fade out
  fadeOut: {
    duration: cosmicDurations.exit,
    easing: cosmicEasings.easeIn,
  },
  
  // Scale in (for modals, cards)
  scaleIn: {
    duration: cosmicDurations.screen,
    easing: cosmicEasings.easeOutCubic,
  },
  
  // Breathing cycle (6 seconds total: 2s in, 2s hold, 2s out)
  breathing: {
    duration: cosmicDurations.breathing,
    easing: cosmicEasings.easeInOutSine,
  },
  
  // Glow pulse
  glowPulse: {
    duration: cosmicDurations.glow,
    easing: cosmicEasings.easeInOut,
  },
} as const;

// ============================================================================
// REDUCED MOTION FALLBACKS
// ============================================================================

export const cosmicReducedMotion = {
  // When reduced motion is enabled, use instant transitions
  // or minimal opacity changes instead of scale/movement
  press: {
    duration: 0,
    easing: Easing.linear,
  },
  fadeIn: {
    duration: cosmicDurations.base,
    easing: cosmicEasings.linear,
  },
  breathing: {
    // Disable breathing animation, use static state
    enabled: false,
  },
} as const;

// ============================================================================
// COMPOSITE OBJECT
// ============================================================================

export const CosmicMotion = {
  durations: cosmicDurations,
  easings: cosmicEasings,
  scales: cosmicScales,
  opacities: cosmicOpacities,
  presets: cosmicPresets,
  reducedMotion: cosmicReducedMotion,
} as const;

// Export types
export type CosmicMotionType = typeof CosmicMotion;
export type CosmicDuration = keyof typeof cosmicDurations;
export type CosmicEasing = keyof typeof cosmicEasings;
export type CosmicPreset = keyof typeof cosmicPresets;

export default CosmicMotion;

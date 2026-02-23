/**
 * Cosmic Motion Tokens
 *
 * Animation timing and easing for the Cosmic theme
 * Respectful of reduced motion preferences
 */

// ============================================================================
// DURATION TOKENS (in milliseconds)
// ============================================================================

export const cosmicDurations = {
  // Micro-interactions
  press: 100, // 80-120ms range - button presses
  hover: 140, // 120-180ms range - hover states
  focus: 140,

  // Standard transitions
  base: 200, // Default transition
  enter: 300, // Element entrance
  exit: 250, // Element exit

  // Screen transitions
  screenEnter: 420, // Per research spec
  screenExit: 220,

  // Ambient animations
  breathCycle: 4200, // Per research spec
  pulse: 2000, // Subtle ambient pulse
  glow: 3000, // Glow intensity shift
} as const;

// ============================================================================
// EASING CURVES
// ============================================================================

export const cosmicEasings = {
  // Standard
  linear: 'linear',

  // Entrance (deceleration)
  easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  easeOutCubic: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  easeOutQuart: 'cubic-bezier(0.0, 0.0, 0.2, 1)',

  // Exit (acceleration)
  easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
  easeInCubic: 'cubic-bezier(0.4, 0.0, 1, 1)',

  // Both (for symmetric animations like breathing)
  easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  easeInOutSine: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  easeInOutCubic: 'cubic-bezier(0.4, 0.0, 0.2, 1)',

  // Aliases
  standard: 'cubic-bezier(0.2, 0.0, 0.2, 1)',
  out: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
} as const;

// ============================================================================
// SCALE VALUES
// ============================================================================

export const cosmicScales = {
  press: 0.98, // Button press scale
  hover: 1.02, // Hover scale
  pop: 1.05, // Success/pop scale
  breathIn: 1.1, // Breathing inhale
  breathOut: 1.0, // Breathing exhale
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
    duration: cosmicDurations.screenEnter,
    easing: cosmicEasings.easeOutCubic,
  },

  // Breathing cycle (6 seconds total: 2s in, 2s hold, 2s out)
  breathing: {
    duration: cosmicDurations.breathCycle,
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
    easing: 'linear',
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

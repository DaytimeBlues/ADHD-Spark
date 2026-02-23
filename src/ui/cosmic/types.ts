/**
 * Cosmic UI Component Types
 *
 * Shared type definitions for cosmic-themed UI primitives
 */

// ============================================================================
// GLOW SYSTEM
// ============================================================================

/**
 * Glow intensity levels
 */
export type GlowLevel = 'none' | 'soft' | 'medium' | 'strong';

/**
 * Surface tone variations for cards
 */
export type SurfaceTone = 'base' | 'raised' | 'sunken';

// ============================================================================
// BACKGROUND VARIANTS
// ============================================================================

/**
 * Background atmosphere variants
 * - ridge: Mountainous, grounded (Home, FogCutter, CBTGuide, Diagnostics)
 * - nebula: Luminous center, time-flow (Ignite, Pomodoro)
 * - moon: Calm radial halo (Anchor, CheckIn, Calendar, Tasks)
 */
export type BackgroundVariant = 'ridge' | 'nebula' | 'moon';

// ============================================================================
// BUTTON SYSTEM
// ============================================================================

/**
 * Button visual variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/**
 * Button size variants
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

// ============================================================================
// TIMER SYSTEM
// ============================================================================

/**
 * Halo ring display modes
 * - progress: Timer progress ring (Ignite, Pomodoro)
 * - breath: Breathing animation (Anchor)
 */
export type HaloMode = 'progress' | 'breath';

/**
 * Timer digit color variants
 */
export type TimerColor = 'default' | 'success' | 'warning' | 'neutral';

/**
 * Timer digit size variants
 */
export type TimerSize = 'sm' | 'md' | 'lg' | 'xl' | 'hero';

// ============================================================================
// CARD SYSTEM
// ============================================================================

/**
 * Card padding presets
 */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

import {
  ViewStyle,
  TextStyle,
  StyleProp,
  AccessibilityRole,
} from 'react-native';

/**
 * Base cosmic component props
 */
export interface CosmicComponentProps {
  /** Test ID for testing */
  testID?: string;
  /** Custom styles */
  style?: StyleProp<ViewStyle | TextStyle>;
}

/**
 * Base cosmic pressable props
 */
export interface CosmicPressableProps extends CosmicComponentProps {
  /** Press handler */
  onPress?: () => void;
  /** Long press handler */
  onLongPress?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility role */
  accessibilityRole?: AccessibilityRole;
  /** Accessibility hint */
  accessibilityHint?: string;
  /** Accessibility state */
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
    busy?: boolean;
    expanded?: boolean;
  };
}

// ============================================================================
// THEME CONTEXT EXTENSIONS
// ============================================================================

/**
 * Extended theme context for cosmic-specific utilities
 */
export interface CosmicThemeExtensions {
  /** Get glow style for level */
  getGlowStyle: (level: GlowLevel) => ViewStyle;
  /** Get text glow style for level */
  getTextGlowStyle: (level: GlowLevel) => TextStyle | undefined;
  /** Get background style for variant */
  getBackgroundStyle: (variant: BackgroundVariant) => ViewStyle;
  /** Check if current theme is cosmic */
  isCosmicTheme: boolean;
}

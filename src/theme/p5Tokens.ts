/**
 * P5Theme - Persona 5 Design System Tokens
 * 
 * Based on the Persona 5 "pop punk" aesthetic - radical chromatic restraint,
 * geometric precision, and theatrical presentation.
 * 
 * Color System: Three core values only
 * - Passion Red (#E60012): Active states, accents, urgency
 * - Pure Black (#000000): Primary backgrounds, depth
 * - Clean White (#FFFFFF): Text, strokes, borders
 * 
 * @module P5Theme
 */

import { Platform } from 'react-native';

// ============================================================================
// CORE COLOR PALETTE - Radical Restraint
// ============================================================================

export const P5Colors = {
  // Primary - Passion Red (Signal Red)
  // Maximum saturation for emotional impact
  primary: '#E60012',
  primaryDark: '#990000',
  primaryLight: '#FF3333',
  
  // Secondary - Pure Black
  // Theatrical framing, OLED power savings
  background: '#000000',
  surface: '#0A0A0A',
  surfaceElevated: '#141414',
  
  // Tertiary - Clean White
  // High contrast text and strokes
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.87)',
  textMuted: 'rgba(255, 255, 255, 0.60)',
  textDisabled: 'rgba(255, 255, 255, 0.38)',
  stroke: '#FFFFFF',
  
  // Functional Exceptions (use with semantic purpose only)
  success: '#00C853',  // Progress indicators, completion states
  warning: '#FFD600',  // Caution states, pending items
  error: '#E60012',    // Same as primary for destructive actions
} as const;

// ============================================================================
// SEMANTIC COLOR ROLES
// ============================================================================

export const P5SemanticColors = {
  // Interactive states
  interactiveDefault: P5Colors.primary,
  interactivePressed: P5Colors.primaryDark,
  interactiveDisabled: P5Colors.textDisabled,
  
  // Background hierarchy
  bgPrimary: P5Colors.background,
  bgSecondary: P5Colors.surface,
  bgTertiary: P5Colors.surfaceElevated,
  
  // Text hierarchy
  textPrimary: P5Colors.text,
  textSecondary: P5Colors.textSecondary,
  textTertiary: P5Colors.textMuted,
  textInverse: P5Colors.background,
  
  // Border/Stroke hierarchy
  borderDefault: 'rgba(255, 255, 255, 0.30)',
  borderStrong: 'rgba(255, 255, 255, 0.60)',
  borderFocus: P5Colors.primary,
  borderWidthDefault: 2,
  borderWidthFocus: 3,
  
  // Status indicators
  statusSuccess: P5Colors.success,
  statusWarning: P5Colors.warning,
  statusError: P5Colors.error,
} as const;

// ============================================================================
// SPACING SYSTEM - 8dp Base Grid with Exponential Scaling
// ============================================================================

export const P5Spacing = {
  xs: 4,      // 0.5× base
  sm: 8,      // 1× base
  md: 16,     // 2× base
  lg: 24,     // 3× base
  xl: 32,     // 4× base
  xxl: 48,    // 6× base
  xxxl: 64,   // 8× base
  xxxxl: 96,  // 12× base
} as const;

// ============================================================================
// TYPOGRAPHY - Bold, Constructed, Angular
// ============================================================================

export const P5Typography = {
  // Font families - Platform-specific fallbacks
  display: {
    fontFamily: Platform.select({
      web: '"Persona 5 Menu Font Prototype", Impact, "Arial Black", sans-serif',
      ios: 'Impact',
      android: 'sans-serif-black',
      default: 'sans-serif-black',
    }),
    fontWeight: '900' as const,
  },
  heading: {
    fontFamily: Platform.select({
      web: '"Persona 5 Menu Font Prototype", Impact, "Arial Black", sans-serif',
      ios: 'Helvetica-Bold',
      android: 'sans-serif-medium',
      default: 'sans-serif-medium',
    }),
    fontWeight: '700' as const,
  },
  body: {
    fontFamily: Platform.select({
      web: 'Roboto, "Helvetica Neue", Arial, sans-serif',
      ios: 'San Francisco',
      android: 'Roboto',
      default: 'sans-serif',
    }),
    fontWeight: '500' as const,
  },
  graffiti: {
    fontFamily: Platform.select({
      web: '"P5 Hatty", Impact, cursive',
      ios: 'Impact',
      android: 'sans-serif-black',
      default: 'sans-serif-black',
    }),
    fontWeight: '900' as const,
  },
} as const;

// Type scale with negative letter-spacing at display sizes
export const P5FontSizes = {
  display1: 56,   // Clock display, splash screens
  display2: 40,   // Screen titles, timer display
  heading1: 28,   // Card titles, section headers
  heading2: 22,   // Subsection labels
  body: 16,       // Primary content
  caption: 12,    // Metadata, labels
} as const;

export const P5LineHeights = {
  tight: 1.0,     // Display text
  normal: 1.2,    // Headings
  relaxed: 1.5,   // Body text
} as const;

export const P5LetterSpacing = {
  display: -0.02,  // Negative for density
  heading: 0,
  body: 0.02,      // Positive for legibility
  caption: 0.03,
} as const;

// ============================================================================
// GEOMETRY - Angular System (22.5° Primary Angle)
// ============================================================================

export const P5Geometry = {
  // Primary diagonal angle - creates strong directionality
  clipAngle: 22.5,
  clipAngleRad: 22.5 * (Math.PI / 180),
  
  // Secondary angles
  angleSubtle: 15,
  angleDramatic: 30,
  
  // Border and radius
  borderRadius: 0,        // Sharp corners - P5 has no rounded elements
  borderWidth: 2,
  borderWidthFocus: 3,
  
  // Safe margins
  safeMarginHorizontal: 72,  // 72dp each side = 144dp attention corridor
} as const;

// Calculate clip depth for a given height
export function getClipDepth(height: number): number {
  return height * Math.tan(P5Geometry.clipAngleRad);
}

// ============================================================================
// MOTION - Theatrical, Snappy, Mechanical Precision
// ============================================================================

export const P5Motion = {
  duration: {
    instant: 80,    // Press feedback
    fast: 100,      // Hover, micro-interactions
    normal: 200,    // State changes
    slow: 300,      // Screen transitions
    dramatic: 500,  // Victory, completion
    entrance: 800,  // Complex sequences (selector polygon)
  },
  
  easing: {
    default: [0.4, 0, 0.2, 1],           // easeOutCubic
    bounce: [0.68, -0.55, 0.265, 1.55],  // easeOutBack
    spring: { stiffness: 1, damping: 0.5, mass: 10 },
    decelerate: [0, 0, 0.2, 1],
  },
} as const;

// ============================================================================
// COMPONENT-SPECIFIC TOKENS
// ============================================================================

export const P5ButtonTokens = {
  minWidth: 160,
  height: {
    sm: 40,
    md: 48,
    lg: 56,
  },
  padding: {
    horizontal: 16,
    vertical: 12,
  },
  clipAngle: P5Geometry.clipAngle,
  borderWidth: P5Geometry.borderWidth,
  borderWidthFocus: P5Geometry.borderWidthFocus,
} as const;

export const P5InputTokens = {
  height: 56,
  labelSpacing: 12,
  borderWidth: 2,
  focusBorderWidth: 3,
  focusGlowSpread: 4,
} as const;

export const P5CardTokens = {
  padding: 24,  // 3× base grid
  sectionGap: 48,  // 6× base grid
} as const;

export const P5SelectorTokens = {
  defaultSize: 200,
  pointCount: 8,
  irregularity: 0.15,
  padding: 8,
} as const;

export const P5NavTokens = {
  height: 64,
  iconSize: 24,
  activeIndicatorSize: 40,
} as const;

// ============================================================================
// ACCESSIBILITY
// ============================================================================

export const P5Accessibility = {
  // WCAG 2.1 AA compliance
  minContrast: 4.5,
  minContrastLarge: 3.0,
  
  // Touch targets
  minTouchTarget: 48,
  
  // Reduced motion support
  reducedMotionQuery: Platform.select({
    web: '(prefers-reduced-motion: reduce)',
    default: null,
  }),
} as const;

// ============================================================================
// COMPLETE THEME OBJECT
// ============================================================================

export const P5Theme = {
  colors: P5Colors,
  semantic: P5SemanticColors,
  spacing: P5Spacing,
  typography: P5Typography,
  fontSizes: P5FontSizes,
  lineHeights: P5LineHeights,
  letterSpacing: P5LetterSpacing,
  geometry: P5Geometry,
  motion: P5Motion,
  button: P5ButtonTokens,
  input: P5InputTokens,
  card: P5CardTokens,
  selector: P5SelectorTokens,
  nav: P5NavTokens,
  accessibility: P5Accessibility,
} as const;

export type P5ThemeType = typeof P5Theme;

export default P5Theme;

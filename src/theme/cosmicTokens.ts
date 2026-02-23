/**
 * Cosmic Theme Tokens
 *
 * Cosmic-Mystic aesthetic with Roerich-adjacent visual language
 * Deep space neutrals + ethereal accent glows
 */

import { Platform } from 'react-native';

// ============================================================================
// COLOR PALETTE
// ============================================================================

const cosmicColors = {
  // Neutrals - Deep space foundation
  obsidian: '#070712', // Deepest background
  midnight: '#0B1022', // Secondary background
  deepSpace: '#111A33', // Card surfaces
  slate: '#2A3552', // Borders, dividers
  mist: '#B9C2D9', // Secondary text
  starlight: '#EEF2FF', // Primary text

  // Accents - Ethereal glows
  nebulaViolet: '#8B5CF6', // Primary accent
  deepIndigo: '#243BFF', // Links, secondary actions
  auroraTeal: '#2DD4BF', // Success, breathing states, focus
  starlightGold: '#F6C177', // Warnings, calendar highlights
  cometRose: '#FB7185', // Errors, destructive actions
} as const;

// ============================================================================
// GLOW DEFINITIONS
// Per research spec: multi-layer shadows with border highlights
// ============================================================================

export type GlowLevel = 'none' | 'soft' | 'medium' | 'strong';

/**
 * Web-specific box shadows per research spec
 * Multi-layer composition for depth
 */
export const webBoxShadows = {
  none: 'none',
  soft: '0 0 0 1px rgba(139, 92, 246, 0.18), 0 10px 24px rgba(7, 7, 18, 0.55)',
  medium:
    '0 0 0 1px rgba(139, 92, 246, 0.28), 0 0 26px rgba(139, 92, 246, 0.22), 0 14px 30px rgba(7, 7, 18, 0.55)',
  strong:
    '0 0 0 1px rgba(45, 212, 191, 0.34), 0 0 34px rgba(45, 212, 191, 0.26), 0 0 70px rgba(139, 92, 246, 0.18), 0 18px 44px rgba(7, 7, 18, 0.62)',
} as const;

/**
 * Native shadow styles per research spec
 */
export const glowStyles = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  soft: {
    shadowColor: cosmicColors.nebulaViolet,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
  },
  medium: {
    shadowColor: cosmicColors.nebulaViolet,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 4,
  },
  strong: {
    shadowColor: cosmicColors.auroraTeal, // Teal tint for strong glow per spec
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 22,
    elevation: 6,
  },
} as const;

// Web-specific text shadow styles for glows
export const textGlowStyles = {
  none: undefined,
  soft: Platform.select({
    web: {
      textShadow: '0 0 18px rgba(139, 92, 246, 0.28)',
    },
    default: undefined,
  }),
  medium: Platform.select({
    web: {
      textShadow:
        '0 0 24px rgba(139, 92, 246, 0.40), 0 0 48px rgba(139, 92, 246, 0.20)',
    },
    default: undefined,
  }),
  strong: Platform.select({
    web: {
      textShadow:
        '0 0 32px rgba(45, 212, 191, 0.50), 0 0 64px rgba(139, 92, 246, 0.30)',
    },
    default: undefined,
  }),
} as const;

// ============================================================================
// SEMANTIC COLOR MAPPING
// ============================================================================

const semanticColors = {
  primary: cosmicColors.nebulaViolet,
  secondary: cosmicColors.deepIndigo,
  success: cosmicColors.auroraTeal,
  warning: cosmicColors.starlightGold,
  error: cosmicColors.cometRose,
  info: cosmicColors.mist,
} as const;

// ============================================================================
// NEUTRAL SCALE (matches LinearTokens structure)
// ============================================================================

const neutralScale = {
  lightest: cosmicColors.starlight,
  lighter: '#D1D9F0',
  light: cosmicColors.mist,
  medium: '#6B7A9C',
  dark: cosmicColors.slate,
  darker: '#1A2540',
  darkest: cosmicColors.obsidian,
} as const;

// ============================================================================
// BRAND SCALE (violet spectrum matching nebulaViolet)
// ============================================================================

const brandScale = {
  50: '#F5F3FF',
  100: '#EDE9FE',
  200: '#DDD6FE',
  300: '#C4B5FD',
  400: '#A78BFA',
  500: cosmicColors.nebulaViolet,
  600: '#7C3AED',
  700: '#6D28D9',
  800: '#5B21B6',
  900: '#4C1D95',
} as const;

// ============================================================================
// SURFACE COLORS (RGBA per research spec for depth)
// ============================================================================

export const surfaceColors = {
  base: 'rgba(14, 20, 40, 0.78)',
  raised: 'rgba(18, 26, 52, 0.86)',
  sunken: 'rgba(10, 14, 30, 0.82)',
  border: 'rgba(185, 194, 217, 0.16)',
} as const;

// ============================================================================
// TEXT COLORS (per research spec)
// ============================================================================

export const textColors = {
  primary: '#EEF2FF',
  secondary: 'rgba(238, 242, 255, 0.78)',
  muted: 'rgba(238, 242, 255, 0.56)',
  onAccent: '#070712',
} as const;

// ============================================================================
// UTILITY COLORS
// ============================================================================

const utilityColors = {
  border: `${cosmicColors.slate}4D`, // 30% opacity
  borderStrong: `${cosmicColors.slate}80`, // 50% opacity
  overlay: `${cosmicColors.obsidian}CC`, // 80% opacity
  scrim: `${cosmicColors.obsidian}99`, // 60% opacity
} as const;

// ============================================================================
// SPACING (matches LinearTokens numeric key structure)
// ============================================================================

export const cosmicSpacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
  40: 160,
  48: 192,
  56: 224,
  64: 256,
} as const;

// ============================================================================
// RADIUS (per research spec: sm 8, md 12, lg 16, xl 22)
// ============================================================================

export const cosmicRadii = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 9999,
} as const;

// ============================================================================
// ELEVATION
// ============================================================================

export const cosmicElevation = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: cosmicColors.obsidian,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: cosmicColors.obsidian,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: cosmicColors.obsidian,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: cosmicColors.obsidian,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.6,
    shadowRadius: 32,
    elevation: 16,
  },
} as const;

// ============================================================================
// TYPOGRAPHY (per research spec)
// - Body: Inter
// - Timer: Space Grotesk with tabular numerals
// - Mono: System mono
// ============================================================================

export const cosmicTypography = {
  heading: {
    fontFamily: Platform.select({
      web: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      ios: 'Inter-SemiBold',
      android: 'Inter-SemiBold',
      default: 'sans-serif',
    }),
    fontWeight: '600' as const,
    letterSpacing: -0.02,
  },
  body: {
    fontFamily: Platform.select({
      web: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      ios: 'Inter-Regular',
      android: 'Inter-Regular',
      default: 'sans-serif',
    }),
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  mono: {
    fontFamily: Platform.select({
      web: 'JetBrains Mono, Fira Code, monospace',
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  timer: {
    fontFamily: Platform.select({
      web: '"Space Grotesk", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      ios: 'Menlo', // Fallback on iOS
      android: 'monospace', // Fallback on Android
      default: 'monospace',
    }),
    fontWeight: '400' as const,
    letterSpacing: 0.8, // Per spec
  },
} as const;

// Per research spec: timer font sizes
export const cosmicTimerSizes = {
  xl: 64,
  lg: 48,
  md: 32,
} as const;

// Font size scale (matches LinearTokens structure)
export const cosmicFontSizes = {
  12: 12,
  14: 14,
  16: 16,
  18: 18,
  20: 20,
  24: 24,
  32: 32,
  48: 48,
  64: 64,
} as const;

// Line heights
export const cosmicLineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

// ============================================================================
// TIME AND ANIMATION MOTION TOKENS
// ============================================================================
export const cosmicMotion = {
  press: 100,
  hover: 140,
  screenEnter: 420,
  screenExit: 220,
  breathCycle: 4200,
} as const;

// ============================================================================
// BACKGROUND VARIANTS
// ============================================================================

export type BackgroundVariant = 'ridge' | 'nebula' | 'moon';

type BackgroundStyle = {
  background?: string;
  backgroundColor?: string;
};

export const backgroundStyles: Record<
  BackgroundVariant,
  BackgroundStyle | undefined
> = {
  ridge: Platform.select({
    web: {
      background: `
        linear-gradient(180deg, 
          ${cosmicColors.obsidian} 0%, 
          ${cosmicColors.midnight} 40%, 
          ${cosmicColors.deepSpace} 100%
        )
      `,
    },
    default: {
      backgroundColor: cosmicColors.obsidian,
    },
  }),
  nebula: Platform.select({
    web: {
      background: `
        radial-gradient(ellipse at center top, 
          ${cosmicColors.deepSpace} 0%, 
          ${cosmicColors.midnight} 50%, 
          ${cosmicColors.obsidian} 100%
        )
      `,
    },
    default: {
      backgroundColor: cosmicColors.obsidian,
    },
  }),
  moon: Platform.select({
    web: {
      background: `
        radial-gradient(ellipse at center 30%, 
          ${cosmicColors.midnight} 0%, 
          ${cosmicColors.obsidian} 70%
        )
      `,
    },
    default: {
      backgroundColor: cosmicColors.obsidian,
    },
  }),
};

// Dimmer overlay for focus screens
export const dimmerOverlay = Platform.select({
  web: {
    background: `${cosmicColors.obsidian}80`, // 50% overlay
  },
  default: {
    backgroundColor: `${cosmicColors.obsidian}80`,
  },
});

// ============================================================================
// COMPOSITE TOKENS OBJECT
// ============================================================================

export const CosmicTokens = {
  colors: {
    neutral: neutralScale,
    brand: brandScale,
    semantic: semanticColors,
    utility: utilityColors,
    cosmic: cosmicColors, // Direct access to raw cosmic colors
  },
  spacing: cosmicSpacing,
  radii: cosmicRadii,
  elevation: cosmicElevation,
  typography: cosmicTypography,
  fontSizes: cosmicFontSizes,
  lineHeights: cosmicLineHeights,
  motion: cosmicMotion,
  glow: glowStyles,
  textGlow: textGlowStyles,
  background: backgroundStyles,
  dimmer: dimmerOverlay,
} as const;

// Export types
export type CosmicTokensType = typeof CosmicTokens;
export type CosmicColor = keyof typeof cosmicColors;
export type CosmicSpacing = keyof typeof cosmicSpacing;
export type CosmicSpacingType = keyof typeof cosmicSpacing;
export type CosmicRadii = keyof typeof cosmicRadii;
export type CosmicRadiiType = keyof typeof cosmicRadii;

// Default export for convenience
export default CosmicTokens;

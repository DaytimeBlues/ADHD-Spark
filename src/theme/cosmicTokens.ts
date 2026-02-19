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
  obsidian: '#070712',      // Deepest background
  midnight: '#0B1022',      // Secondary background
  deepSpace: '#111A33',     // Card surfaces
  slate: '#2A3552',         // Borders, dividers
  mist: '#B9C2D9',          // Secondary text
  starlight: '#EEF2FF',     // Primary text

  // Accents - Ethereal glows
  nebulaViolet: '#8B5CF6',  // Primary accent
  deepIndigo: '#243BFF',    // Links, secondary actions
  auroraTeal: '#2DD4BF',    // Success, breathing states, focus
  starlightGold: '#F6C177', // Warnings, calendar highlights
  cometRose: '#FB7185',     // Errors, destructive actions
} as const;

// ============================================================================
// GLOW DEFINITIONS
// ============================================================================

export type GlowLevel = 'none' | 'soft' | 'medium' | 'strong';

export const glowStyles = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  soft: {
    shadowColor: `${cosmicColors.nebulaViolet}40`, // 25% opacity
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  medium: {
    shadowColor: `${cosmicColors.nebulaViolet}80`, // 50% opacity
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  strong: {
    shadowColor: cosmicColors.nebulaViolet, // 100% opacity
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 16,
  },
} as const;

// Web-specific text shadow styles for glows
export const textGlowStyles = {
  none: undefined,
  soft: Platform.select({
    web: {
      textShadow: `0 0 16px ${cosmicColors.nebulaViolet}80`,
    },
    default: undefined,
  }),
  medium: Platform.select({
    web: {
      textShadow: `0 0 24px ${cosmicColors.nebulaViolet}B3, 0 0 48px ${cosmicColors.nebulaViolet}66`,
    },
    default: undefined,
  }),
  strong: Platform.select({
    web: {
      textShadow: `0 0 32px ${cosmicColors.nebulaViolet}, 0 0 64px ${cosmicColors.nebulaViolet}80`,
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
// RADIUS (cosmic uses rounded corners vs linear's sharp)
// ============================================================================

export const cosmicRadii = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
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
// TYPOGRAPHY
// ============================================================================

export const cosmicTypography = {
  heading: {
    fontFamily: Platform.select({
      web: 'Inter, system-ui, sans-serif',
      ios: 'Inter-SemiBold',
      android: 'Inter-SemiBold',
      default: 'sans-serif',
    }),
    fontWeight: '600' as const,
    letterSpacing: -0.02,
  },
  body: {
    fontFamily: Platform.select({
      web: 'Inter, system-ui, sans-serif',
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
// BACKGROUND VARIANTS
// ============================================================================

export type BackgroundVariant = 'ridge' | 'nebula' | 'moon';

export const backgroundStyles: Record<BackgroundVariant, any> = {
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
  glow: glowStyles,
  textGlow: textGlowStyles,
  background: backgroundStyles,
  dimmer: dimmerOverlay,
} as const;

// Export types
export type CosmicTokensType = typeof CosmicTokens;
export type CosmicColor = keyof typeof cosmicColors;
export type CosmicSpacing = keyof typeof cosmicSpacing;
export type CosmicRadii = keyof typeof cosmicRadii;

// Default export for convenience
export default CosmicTokens;

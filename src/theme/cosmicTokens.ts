/**
 * Cosmic Theme Tokens
 *
 * Cosmic-Mystic aesthetic with Roerich-adjacent visual language
 * Deep space neutrals + ethereal accent glows
 *
 * This file is a thin re-export layer. All tokens are defined in
 * the cosmic/ subdirectory modules for better maintainability.
 */

import { ThemeTokens } from './types';

// Import from split modules
import { cosmicColors, CosmicColor } from './cosmic/colors';
import {
  GlowLevel,
  webBoxShadows,
  glowStyles,
  textGlowStyles,
} from './cosmic/glow';
import {
  cosmicSpacing,
  CosmicSpacing,
  CosmicSpacingType,
} from './cosmic/spacing';
import { cosmicRadii, CosmicRadii, CosmicRadiiType } from './cosmic/radii';
import { cosmicElevation } from './cosmic/elevation';
import {
  cosmicTypography,
  cosmicTimerSizes,
  cosmicFontSizes,
  cosmicLineHeights,
} from './cosmic/typography';
import { cosmicMotion } from './cosmic/motion';
import {
  BackgroundVariant,
  backgroundStyles,
  dimmerOverlay,
} from './cosmic/backgrounds';
import {
  semanticColors,
  neutralScale,
  brandScale,
  surfaceColors,
  textColors,
  utilityColors,
} from './cosmic/semantic';

// Re-export all types
export type { GlowLevel, BackgroundVariant };
export type {
  CosmicColor,
  CosmicSpacing,
  CosmicSpacingType,
  CosmicRadii,
  CosmicRadiiType,
};

// Re-export individual modules for direct access
export {
  cosmicColors,
  webBoxShadows,
  glowStyles,
  textGlowStyles,
  cosmicSpacing,
  cosmicRadii,
  cosmicElevation,
  cosmicTypography,
  cosmicTimerSizes,
  cosmicFontSizes,
  cosmicLineHeights,
  cosmicMotion,
  backgroundStyles,
  dimmerOverlay,
  semanticColors,
  neutralScale,
  brandScale,
  surfaceColors,
  textColors,
  utilityColors,
};

// ============================================================================
// COMPOSITE TOKENS OBJECT
// ============================================================================

export const CosmicTokens: ThemeTokens = {
  colors: {
    neutral: neutralScale,
    brand: brandScale,
    semantic: semanticColors,
    utility: utilityColors,
    text: textColors,
    success: {
      main: semanticColors.success,
      subtle: 'rgba(45, 212, 191, 0.12)',
    },
    warning: {
      main: semanticColors.warning,
      subtle: 'rgba(246, 193, 119, 0.12)',
    },
    error: {
      main: semanticColors.error,
      subtle: 'rgba(244, 114, 182, 0.12)',
    },
    info: {
      main: semanticColors.info,
      subtle: 'rgba(185, 194, 217, 0.12)',
    },
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

// Export type
export type CosmicTokensType = typeof CosmicTokens;

// Default export for convenience
export default CosmicTokens;

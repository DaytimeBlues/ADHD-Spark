// Design tokens for Spark ADHD.
// Web-first, must also work on Android web.

import {
  LinearColors,
  LinearSpacing,
  LinearTypography,
  LinearRadii,
  LinearElevation,
} from './linearTokens';
import { Motion } from './motion';

// Cosmic theme tokens
export {
  CosmicTokens,
  cosmicSpacing as CosmicSpacing,
  cosmicRadii as CosmicRadii,
  cosmicTypography as CosmicTypography,
  cosmicElevation as CosmicElevation,
  cosmicTimerSizes,
  surfaceColors,
  textColors,
  webBoxShadows,
  glowStyles,
  textGlowStyles,
  backgroundStyles,
  dimmerOverlay,
  type BackgroundVariant,
  type GlowLevel,
  type CosmicTokensType,
  type CosmicColor,
  type CosmicSpacing,
  type CosmicRadii,
} from './cosmicTokens';

export {
  CosmicMotion,
  cosmicDurations,
  cosmicEasings,
  cosmicPresets,
  type CosmicMotionType,
} from './cosmicMotion';

// Theme variant types and utilities
export {
  type ThemeVariant,
  THEME_VARIANTS,
  DEFAULT_THEME_VARIANT,
  migrateThemeVariant,
  isValidThemeVariant,
  assertThemeVariant,
  THEME_METADATA,
} from './themeVariant';

export const Colors = LinearColors;
export const Spacing = LinearSpacing;
export const TypeScale = {
  ...LinearTypography.size,
  fontFamily: LinearTypography.fontFamily,
  weight: LinearTypography.weight,
  lineHeight: LinearTypography.lineHeight,
};
export const Radii = LinearRadii;
export const Elevation = LinearElevation;

export const Layout = {
  maxWidth: {
    prose: 680,
    content: 960,
  },
  minTapTarget: 44,
  minTapTargetComfortable: 48,
} as const;

export const Tokens = {
  colors: Colors,
  spacing: Spacing,
  type: TypeScale,
  radii: Radii,
  elevation: Elevation,
  layout: Layout,
  motion: Motion,
} as const;

export type TokensType = typeof Tokens;

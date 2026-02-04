// Design tokens for Spark ADHD.
// Web-first, must also work on Android web.

import { LinearColors, LinearSpacing, LinearTypography, LinearRadii, LinearElevation } from './linearTokens';

export const Colors = LinearColors;
export const Spacing = LinearSpacing;
export const TypeScale = LinearTypography.size;
export const Radii = LinearRadii;
export const Elevation = LinearElevation;

const shadowColor = 'hsl(240, 30%, 5%)';

export const Elevation = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.26,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

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
} as const;

export type TokensType = typeof Tokens;

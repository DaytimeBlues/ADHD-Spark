// Design tokens for Spark ADHD.
// Web-first, must also work on Android web.

export const Colors = {
  // Neutral scale (cool greys) for backgrounds, surfaces, and text.
  neutral: {
    0: 'hsl(240, 20%, 98%)',
    50: 'hsl(240, 18%, 95%)',
    100: 'hsl(240, 16%, 88%)',
    200: 'hsl(240, 14%, 78%)',
    300: 'hsl(240, 12%, 62%)',
    400: 'hsl(240, 12%, 48%)',
    500: 'hsl(240, 14%, 30%)',
    600: 'hsl(240, 18%, 20%)',
    700: 'hsl(240, 22%, 14%)',
    800: 'hsl(240, 26%, 10%)',
    900: 'hsl(240, 30%, 6%)',
  },

  // Brand (purple/blue) scale.
  brand: {
    50: 'hsl(266, 100%, 96%)',
    100: 'hsl(266, 100%, 92%)',
    200: 'hsl(266, 95%, 84%)',
    300: 'hsl(266, 88%, 74%)',
    400: 'hsl(266, 78%, 64%)',
    500: 'hsl(266, 70%, 56%)',
    600: 'hsl(266, 74%, 46%)',
    700: 'hsl(266, 82%, 36%)',
    800: 'hsl(266, 90%, 26%)',
    900: 'hsl(266, 100%, 16%)',
  },

  // Semantic scales (trimmed to the shades we need).
  success: {
    200: 'hsl(145, 60%, 78%)',
    500: 'hsl(145, 70%, 42%)',
    800: 'hsl(145, 75%, 22%)',
  },
  warning: {
    200: 'hsl(40, 90%, 80%)',
    500: 'hsl(40, 90%, 52%)',
    800: 'hsl(40, 90%, 26%)',
  },
  danger: {
    200: 'hsl(0, 85%, 80%)',
    500: 'hsl(0, 80%, 56%)',
    800: 'hsl(0, 75%, 28%)',
  },
} as const;

export const Spacing = {
  0: 0,
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  24: 24,
  32: 32,
  48: 48,
  64: 64,
  96: 96,
} as const;

export const TypeScale = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
  hero: 56,
  mega: 64,
  giga: 96,
} as const;

export const Radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 9999,
} as const;

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

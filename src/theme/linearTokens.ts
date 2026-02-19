// Spark Industrial Design Tokens
// "Nothing" Aesthetic: Monochrome, Purple Accent, Dot Matrix, Raw.

export const LinearColors = {
  // Brand - Purple Accent (Nothing Style)
  brand: {
    50: '#F5F0FF',
    100: '#EDE0FF',
    200: '#DBC0FF',
    300: '#C290FF',
    400: '#A350FF',
    500: '#8000FF', // Primary Accent (Electric Purple)
    600: '#6C00D8',
    700: '#5800B0',
    800: '#440088',
    900: '#300060',
  },

  // Alias indigo to red for backward compatibility but using new aesthetic
  indigo: {
    primary: '#FF0033',
    hover: '#D8002B',
    active: '#B00023',
    subtle: 'rgba(255, 0, 51, 0.1)',
  },

  // Danger/Error
  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Monochrome Palette (Pure Black/White/Gray)
  neutral: {
    // Named keys
    darkest: '#000000', // Pure Black
    darker: '#0A0A0A', // Almost Black
    dark: '#141414', // Surface
    border: '#FFFFFF', // Primary Border (Pure White)
    borderSubtle: '#444444', // Divider Gray

    // Glass Tokens
    glass: 'rgba(255, 255, 255, 0.03)',
    glassStroke: 'rgba(255, 255, 255, 0.1)',

    // Numbered scale
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F0F0F0',
    200: '#E0E0E0',
    300: '#C0C0C0',
    400: '#A0A0A0',
    500: '#808080',
    600: '#606060',
    700: '#404040',
    800: '#202020',
    900: '#000000',
  },

  // Text
  text: {
    primary: '#FFFFFF',
    placeholder: '#666666',
    secondary: '#888888',
    tertiary: '#555555',
    disabled: '#333333',
    link: '#FF0033',
  },

  // Semantic
  success: {
    main: '#00FF00', // Terminal Green
    subtle: 'rgba(0, 255, 0, 0.1)',
  },
  warning: {
    main: '#FFD700', // Industrial Yellow
    subtle: 'rgba(255, 215, 0, 0.1)',
  },
  error: {
    main: '#FF0000',
    subtle: 'rgba(255, 0, 0, 0.1)',
  },
  info: {
    main: '#FFFFFF',
    subtle: 'rgba(255, 255, 255, 0.1)',
  },
} as const;

export const LinearSpacing = {
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
  48: 192,
} as const;

export const LinearRadii = {
  none: 0,
  sm: 0, // Sharp
  md: 0, // Sharp
  lg: 0, // Sharp
  xl: 0, // Sharp
  full: 9999, // Keep pills for status badges only
  pill: 9999,
} as const;

export const LinearTypography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    mono: 'SF Mono, Monaco, Inconsolata, "Fira Mono", monospace',
    // Roles
    header: 'SF Mono, Monaco, Inconsolata, "Fira Mono", monospace', // Dot-matrix intent
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  size: {
    h1: 32,
    h2: 24,
    h3: 20,
    h4: 18,
    base: 14,
    sm: 13,
    xs: 12,
    xxs: 11,
    // Extended
    lg: 16,
    xl: 18,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    giga: 72,
    timerHero: 140,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 1, // For uppercase headers
    widest: 2,
  },
} as const;

export const LinearElevation = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 }, // Hard shadow
    shadowOpacity: 0.5,
    shadowRadius: 0, // Zero radius for retro/sharp feel
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 }, // Hard shadow
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 6,
  },
} as const;

export const LinearTokens = {
  colors: LinearColors,
  spacing: LinearSpacing,
  type: LinearTypography,
  radii: LinearRadii,
  elevation: LinearElevation,
} as const;

export type LinearTokensType = typeof LinearTokens;

// Linear Design Tokens for spark-adhd-backup
// Based on Linear.app's minimalist, developer-centric aesthetic
// Extended to support both named keys and numbered scales for backward compatibility

export const LinearColors = {
    // Brand - numbered scale for backward compatibility
    brand: {
        50: '#EEF2FF',
        100: '#E0E7FF',
        200: '#C7D2FE',
        300: '#A5B4FC',
        400: '#818CF8',
        500: '#5E6AD2',  // Primary
        600: '#4E5AC2',
        700: '#3E4AB2',
        800: '#3730A3',
        900: '#312E81',
    },

    // Indigo (alias for brand)
    indigo: {
        primary: '#5E6AD2',
        hover: '#4E5AC2',
        active: '#3E4AB2',
        subtle: 'rgba(94, 106, 210, 0.1)',
    },

    // Danger/Error - numbered scale
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

    // Dark Mode Palette - with numbered scale aliases
    neutral: {
        // Named keys (original)
        darkest: '#111111',
        darker: '#1A1A1A',
        dark: '#2A2A2A',
        border: '#333333',
        borderSubtle: '#252525',
        // Numbered scale (backward compatibility)
        0: '#FFFFFF',
        50: '#FAFAFA',
        100: '#F4F4F5',
        200: '#E4E4E7',
        300: '#A0A0A0',
        400: '#707070',
        500: '#4A4A4A',
        600: '#333333',
        700: '#2A2A2A',
        800: '#1A1A1A',
        900: '#111111',
    },

    // Text - Dark Mode
    text: {
        primary: '#FFFFFF',
        secondary: '#A0A0A0',
        tertiary: '#707070',
        disabled: '#4A4A4A',
        link: '#5E6AD2',
    },

    // Semantic
    success: {
        main: '#10B981',
        subtle: 'rgba(16, 185, 129, 0.1)',
    },
    warning: {
        main: '#F59E0B',
        subtle: 'rgba(245, 158, 11, 0.1)',
    },
    error: {
        main: '#EF4444',
        subtle: 'rgba(239, 68, 68, 0.1)',
    },
    info: {
        main: '#3B82F6',
        subtle: 'rgba(59, 130, 246, 0.1)',
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
    // Extended spacing (backward compatibility)
    24: 96,
    32: 128,
    48: 192,
} as const;

export const LinearRadii = {
    none: 0,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    full: 9999,
    // Alias for backward compatibility
    pill: 9999,
} as const;

export const LinearTypography = {
    fontFamily: {
        sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        mono: 'SF Mono, Monaco, Inconsolata, "Fira Mono", monospace',
    },
    size: {
        // Original named sizes
        h1: 32,
        h2: 24,
        h3: 20,
        h4: 18,
        base: 14,
        sm: 13,
        xs: 12,
        xxs: 11,
        // Extended sizes (backward compatibility)
        lg: 16,
        xl: 18,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 48,
        giga: 72,
    },
    weight: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
    lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
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
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
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

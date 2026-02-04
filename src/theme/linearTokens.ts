// Linear Design Tokens for spark-adhd-backup
// Based on Linear.app's minimalist, developer-centric aesthetic

export const LinearColors = {
    // Brand
    indigo: {
        primary: '#5E6AD2',
        hover: '#4E5AC2',
        active: '#3E4AB2',
        subtle: 'rgba(94, 106, 210, 0.1)',
    },

    // Dark Mode Palette
    neutral: {
        darkest: '#111111',  // Woodsmoke - Deep background
        darker: '#1A1A1A',   // Oslo Gray - Elevated surfaces
        dark: '#2A2A2A',     // Slate - Cards, panels
        border: '#333333',   // Borders, dividers
        borderSubtle: '#252525',
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
    2: 8,   // Base unit
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
} as const;

export const LinearRadii = {
    none: 0,
    sm: 4,     // Badges, tags
    md: 6,     // Buttons, inputs
    lg: 8,     // Cards, modals
    xl: 12,    // Large containers
    full: 9999,
} as const;

export const LinearTypography = {
    // We use system font names that fallback to Inter if linked/available
    fontFamily: {
        sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        mono: 'SF Mono, Monaco, Inconsolata, "Fira Mono", monospace',
    },
    size: {
        h1: 32,
        h2: 24,
        h3: 20,
        h4: 18,
        base: 14, // Linear's default UI size
        sm: 13,
        xs: 12,
        xxs: 11,
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

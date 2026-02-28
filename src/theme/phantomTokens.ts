/**
 * Phantom Theme Tokens
 *
 * Persona 5 "Phantom Thief" aesthetic — high-energy, jagged, kinetic.
 * Signal Red + Pure Black + Pure White. No rounded corners.
 */

import { Platform } from 'react-native';

// ============================================================================
// COLOR PALETTE
// ============================================================================

const phantomColors = {
    // Neutrals — stark black foundation
    obsidian: '#000000',   // Primary background (pure black)
    midnight: '#0A0A1A',   // Secondary background (navy depth)
    deepSpace: '#141414',  // Card surfaces (charcoal)
    slate: '#333333',      // Borders, dividers
    mist: '#CCCCCC',       // Secondary text
    starlight: '#FFFFFF',  // Primary text (pure white)

    // Accents — P5 signal colors
    nebulaViolet: '#D80000', // Primary accent = Signal Red (remapped)
    deepIndigo: '#DC143C',   // Secondary actions = Crimson
    auroraTeal: '#00CC00',   // Success (keep green for semantics)
    starlightGold: '#FFD700', // Warnings
    cometRose: '#FF3333',    // Errors, destructive
} as const;

// ============================================================================
// GLOW DEFINITIONS — P5 uses hard shadows, not soft glows
// ============================================================================

export type GlowLevel = 'none' | 'soft' | 'medium' | 'strong';

export const webBoxShadows = {
    none: 'none',
    soft: '4px 4px 0px #D80000',
    medium: '6px 6px 0px #D80000',
    strong: '8px 8px 0px #D80000, 12px 12px 0px rgba(0,0,0,0.5)',
} as const;

export const glowStyles = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    soft: {
        shadowColor: phantomColors.nebulaViolet,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.8,
        shadowRadius: 0,
        elevation: 2,
    },
    medium: {
        shadowColor: phantomColors.nebulaViolet,
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.9,
        shadowRadius: 0,
        elevation: 4,
    },
    strong: {
        shadowColor: phantomColors.nebulaViolet,
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 1.0,
        shadowRadius: 0,
        elevation: 6,
    },
} as const;

// P5 doesn't use text glows — use hard text shadows
export const textGlowStyles = {
    none: undefined,
    soft: Platform.select({
        web: { textShadow: '2px 2px 0px #D80000' },
        default: undefined,
    }),
    medium: Platform.select({
        web: { textShadow: '3px 3px 0px #D80000' },
        default: undefined,
    }),
    strong: Platform.select({
        web: { textShadow: '4px 4px 0px #D80000, 6px 6px 0px rgba(0,0,0,0.5)' },
        default: undefined,
    }),
} as const;

// ============================================================================
// SEMANTIC COLOR MAPPING
// ============================================================================

const semanticColors = {
    primary: phantomColors.nebulaViolet,  // Signal Red
    secondary: phantomColors.deepIndigo,   // Crimson
    success: phantomColors.auroraTeal,
    warning: phantomColors.starlightGold,
    error: phantomColors.cometRose,
    info: phantomColors.mist,
} as const;

// ============================================================================
// NEUTRAL SCALE
// ============================================================================

const neutralScale = {
    lightest: phantomColors.starlight,
    lighter: '#E0E0E0',
    light: phantomColors.mist,
    medium: '#666666',
    dark: phantomColors.slate,
    darker: '#1A1A1A',
    darkest: phantomColors.obsidian,
} as const;

// ============================================================================
// BRAND SCALE (red spectrum for P5)
// ============================================================================

const brandScale = {
    50: '#FFF5F5',
    100: '#FFE0E0',
    200: '#FFB3B3',
    300: '#FF8080',
    400: '#FF4040',
    500: phantomColors.nebulaViolet, // #D80000
    600: '#B30000',
    700: '#8B0000',
    800: '#660000',
    900: '#400000',
} as const;

// ============================================================================
// SURFACE COLORS
// ============================================================================

export const surfaceColors = {
    base: 'rgba(0, 0, 0, 0.95)',
    raised: 'rgba(20, 20, 20, 0.95)',
    sunken: 'rgba(0, 0, 0, 1.0)',
    border: 'rgba(255, 255, 255, 0.3)',
} as const;

// ============================================================================
// TEXT COLORS
// ============================================================================

export const textColors = {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.85)',
    muted: 'rgba(255, 255, 255, 0.6)',
    onAccent: '#FFFFFF',
} as const;

// ============================================================================
// UTILITY COLORS
// ============================================================================

const utilityColors = {
    border: 'rgba(255, 255, 255, 0.3)',
    borderStrong: 'rgba(255, 255, 255, 0.6)',
    overlay: 'rgba(0, 0, 0, 0.85)',
    scrim: 'rgba(0, 0, 0, 0.7)',
} as const;

// ============================================================================
// SPACING (reuse cosmic spacing — functional, not aesthetic)
// ============================================================================

export const phantomSpacing = {
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
// RADIUS — P5 uses NO rounded corners. Everything is sharp.
// ============================================================================

export const phantomRadii = {
    none: 0,
    sm: 0,
    md: 0,
    lg: 0,
    xl: 0,
    pill: 0,
} as const;

// ============================================================================
// ELEVATION — Hard offset shadows, no blur (comic book style)
// ============================================================================

export const phantomElevation = {
    none: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    sm: {
        shadowColor: '#D80000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 2,
    },
    md: {
        shadowColor: '#D80000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    lg: {
        shadowColor: '#D80000',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 8,
    },
    xl: {
        shadowColor: '#000000',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 16,
    },
} as const;

// ============================================================================
// TYPOGRAPHY — Bold, impactful, uppercase-biased
// ============================================================================

export const phantomTypography = {
    heading: {
        fontFamily: Platform.select({
            web: 'Impact, "Arial Black", "Helvetica Neue", sans-serif',
            ios: 'Impact',
            android: 'sans-serif-black',
            default: 'sans-serif',
        }),
        fontWeight: '900' as const,
        letterSpacing: 1.5,
    },
    body: {
        fontFamily: Platform.select({
            web: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
            ios: 'Helvetica-Bold',
            android: 'sans-serif-medium',
            default: 'sans-serif',
        }),
        fontWeight: '700' as const,
        letterSpacing: 0.5,
    },
    mono: {
        fontFamily: Platform.select({
            web: '"Courier New", Courier, monospace',
            ios: 'Courier-Bold',
            android: 'monospace',
            default: 'monospace',
        }),
        fontWeight: '700' as const,
        letterSpacing: 0,
    },
    timer: {
        fontFamily: Platform.select({
            web: 'Impact, "Arial Black", sans-serif',
            ios: 'Impact',
            android: 'sans-serif-black',
            default: 'monospace',
        }),
        fontWeight: '900' as const,
        letterSpacing: 2,
    },
} as const;

export const phantomTimerSizes = {
    xl: 72,
    lg: 56,
    md: 40,
} as const;

export const phantomFontSizes = {
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

export const phantomLineHeights = {
    tight: 1.1,
    normal: 1.3,
    relaxed: 1.5,
} as const;

// ============================================================================
// MOTION — Snappy, aggressive, comic-book pop
// ============================================================================

export const phantomMotion = {
    press: 80,
    hover: 100,
    screenEnter: 250,
    screenExit: 150,
    breathCycle: 2000,
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
        repeating-conic-gradient(
          #D80000 0deg 10deg,
          #8B0000 10deg 20deg
        )
      `,
        },
        default: {
            backgroundColor: phantomColors.obsidian,
        },
    }),
    nebula: Platform.select({
        web: {
            background: `
        radial-gradient(circle at center,
          #1A0000 0%,
          #000000 100%
        )
      `,
        },
        default: {
            backgroundColor: phantomColors.obsidian,
        },
    }),
    moon: Platform.select({
        web: {
            background: `
        linear-gradient(135deg,
          #0A0A1A 0%,
          #000000 50%,
          #1A0000 100%
        )
      `,
        },
        default: {
            backgroundColor: phantomColors.obsidian,
        },
    }),
};

export const dimmerOverlay = Platform.select({
    web: {
        background: `${phantomColors.obsidian}CC`,
    },
    default: {
        backgroundColor: `${phantomColors.obsidian}CC`,
    },
});

// ============================================================================
// COMPOSITE TOKENS OBJECT — Same shape as CosmicTokens
// ============================================================================

export const PhantomTokens = {
    colors: {
        neutral: neutralScale,
        brand: brandScale,
        semantic: semanticColors,
        utility: utilityColors,
        cosmic: phantomColors, // Keep key as 'cosmic' for compatibility
    },
    spacing: phantomSpacing,
    radii: phantomRadii,
    elevation: phantomElevation,
    typography: phantomTypography,
    fontSizes: phantomFontSizes,
    lineHeights: phantomLineHeights,
    motion: phantomMotion,
    glow: glowStyles,
    textGlow: textGlowStyles,
    background: backgroundStyles,
    dimmer: dimmerOverlay,
} as const;

// Export types
export type PhantomTokensType = typeof PhantomTokens;

// Default export for convenience
export default PhantomTokens;

/**
 * Theme Variant Types and Utilities
 *
 * Type definitions and migration helpers for theme variants
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Available theme variants
 * - 'linear': Original Nothing aesthetic (monochrome, sharp, technical)
 * - 'cosmic': New Cosmic-Mystic aesthetic (deep space, glows, ethereal)
 */
export type ThemeVariant = 'linear' | 'cosmic' | 'phantom';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Theme variant constants for type-safe usage
 */
export const THEME_VARIANTS = {
  LINEAR: 'linear' as const,
  COSMIC: 'cosmic' as const,
  PHANTOM: 'phantom' as const,
};

/**
 * Storage key for theme persistence
 * (matches existing STORAGE_KEYS.theme in StorageService)
 */
export const THEME_STORAGE_KEY = 'theme';

/**
 * Default theme variant
 */
export const DEFAULT_THEME_VARIANT: ThemeVariant = 'cosmic';

// ============================================================================
// MIGRATION UTILITIES
// ============================================================================

/**
 * Legacy theme values that might exist in storage
 * Maps old values to current theme variants
 */
const LEGACY_THEME_MAP: Record<string, ThemeVariant> = {
  // Direct mappings
  linear: 'linear',
  cosmic: 'cosmic',
  phantom: 'phantom',

  // Legacy/deprecated values (if any existed)
  default: 'linear',
  dark: 'linear',
  light: 'linear',
  metro: 'linear',
};

/**
 * Migrates a stored theme value to the current ThemeVariant type
 *
 * @param value - The stored theme value (could be legacy)
 * @returns Valid ThemeVariant
 *
 * @example
 * const storedValue = await AsyncStorage.getItem('theme');
 * const variant = migrateThemeVariant(storedValue);
 */
export function migrateThemeVariant(value: string | null): ThemeVariant {
  if (!value) {
    return DEFAULT_THEME_VARIANT;
  }

  // Check if it's a known legacy value
  if (value in LEGACY_THEME_MAP) {
    return LEGACY_THEME_MAP[value];
  }

  // Validate it's a current variant
  if (value === 'linear' || value === 'cosmic' || value === 'phantom') {
    return value;
  }

  // Unknown value, default to linear for safety
  console.warn(
    `[Theme] Unknown theme value "${value}", defaulting to "${DEFAULT_THEME_VARIANT}"`,
  );
  return DEFAULT_THEME_VARIANT;
}

/**
 * Validates if a value is a valid ThemeVariant
 */
export function isValidThemeVariant(value: unknown): value is ThemeVariant {
  return (
    typeof value === 'string' && (value === 'linear' || value === 'cosmic' || value === 'phantom')
  );
}

/**
 * Type guard for ThemeVariant
 */
export function assertThemeVariant(
  value: unknown,
): asserts value is ThemeVariant {
  if (!isValidThemeVariant(value)) {
    throw new Error(
      `Invalid theme variant: ${value}. Expected 'linear', 'cosmic', or 'phantom'.`,
    );
  }
}

// ============================================================================
// THEME METADATA
// ============================================================================

/**
 * Human-readable metadata for each theme variant
 * Useful for UI toggle displays
 */
export const THEME_METADATA: Record<
  ThemeVariant,
  {
    label: string;
    description: string;
    preview: {
      background: string;
      accent: string;
      text: string;
    };
  }
> = {
  linear: {
    label: 'Linear',
    description: 'Clean monochrome aesthetic with sharp edges',
    preview: {
      background: '#000000',
      accent: '#8B5CF6',
      text: '#FFFFFF',
    },
  },
  cosmic: {
    label: 'Cosmic',
    description: 'Mystical deep space with ethereal glows',
    preview: {
      background: '#070712',
      accent: '#8B5CF6',
      text: '#EEF2FF',
    },
  },
  phantom: {
    label: 'Phantom',
    description: 'High-energy Persona 5 style — jagged, kinetic, signal red',
    preview: {
      background: '#000000',
      accent: '#D80000',
      text: '#FFFFFF',
    },
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  THEME_VARIANTS,
  THEME_STORAGE_KEY,
  DEFAULT_THEME_VARIANT,
  migrateThemeVariant,
  isValidThemeVariant,
  assertThemeVariant,
  THEME_METADATA,
};

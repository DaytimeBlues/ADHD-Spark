import { LinearTokens } from './linearTokens';
import { CosmicTokens } from './cosmicTokens';
import { NightAweTokens } from './nightAweTokens';
import { ThemeVariant, THEME_METADATA } from './themeVariant';
import { useThemeStore } from '../store/useThemeStore';

export interface ThemeContextValue {
  variant: ThemeVariant;
  setVariant: (variant: ThemeVariant) => Promise<void>;
  t: typeof LinearTokens | typeof CosmicTokens | typeof NightAweTokens;
  isCosmic: boolean;
  isNightAwe: boolean;
  isLinear: boolean;
  isLoaded: boolean;
  metadata: (typeof THEME_METADATA)[ThemeVariant];
}

/**
 * Hook to access the current theme state and tokens.
 * Migrated from ThemeProvider to atomic Zustand state.
 */
export function useTheme(): ThemeContextValue {
  const { variant, setVariant, _hasHydrated } = useThemeStore();
  const metadata = THEME_METADATA[variant];

  const tokens =
    variant === 'cosmic'
      ? CosmicTokens
      : variant === 'nightAwe'
        ? NightAweTokens
        : LinearTokens;

  return {
    variant,
    setVariant: async (v: ThemeVariant) => setVariant(v),
    t: tokens,
    isCosmic: variant === 'cosmic',
    isNightAwe: variant === 'nightAwe',
    isLinear: variant === 'linear',
    isLoaded: _hasHydrated,
    metadata,
  };
}

export default useTheme;

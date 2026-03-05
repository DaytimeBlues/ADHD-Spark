import { LinearTokens } from './linearTokens';
import { CosmicTokens } from './cosmicTokens';
import { ThemeVariant, THEME_METADATA } from './themeVariant';
import { useThemeStore } from '../store/useThemeStore';

export interface ThemeContextValue {
  variant: ThemeVariant;
  setVariant: (variant: ThemeVariant) => Promise<void>;
  t: typeof LinearTokens | typeof CosmicTokens;
  isCosmic: boolean;
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

  const tokens = variant === 'cosmic' ? CosmicTokens : LinearTokens;

  return {
    variant,
    setVariant: async (v: ThemeVariant) => setVariant(v),
    t: tokens,
    isCosmic: variant === 'cosmic',
    isLinear: variant === 'linear',
    isLoaded: _hasHydrated,
    metadata: THEME_METADATA[variant],
  };
}

export default useTheme;

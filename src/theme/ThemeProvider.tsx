/**
 * ThemeProvider (Zustand Refactor)
 *
 * This file previously housed a heavy React Context Provider. It has been
 * refactored to use Zustand for atomic state updates, eliminating unnecessary
 * re-renders across the component tree. The `useTheme` signature remains
 * identical to prevent massive codebase refactoring.
 */

import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '../services/StorageService';

import { LinearTokens } from './linearTokens';
import { CosmicTokens } from './cosmicTokens';
import {
  ThemeVariant,
  DEFAULT_THEME_VARIANT,
  THEME_METADATA,
} from './themeVariant';

// ============================================================================
// ZUSTAND STORE
// ============================================================================

interface ThemeStoreState {
  variant: ThemeVariant;
  setVariant: (variant: ThemeVariant) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useThemeStore = create<ThemeStoreState>()(
  persist(
    (set) => ({
      variant: DEFAULT_THEME_VARIANT,
      setVariant: (variant) => set({ variant }),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'spark-theme-storage',
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    },
  ),
);

// ============================================================================
// EXPORT TYPES (Maintained for legacy compatibility)
// ============================================================================

export interface ThemeContextValue {
  variant: ThemeVariant;
  setVariant: (variant: ThemeVariant) => Promise<void>;
  t: typeof LinearTokens | typeof CosmicTokens;
  isCosmic: boolean;
  isLinear: boolean;
  isLoaded: boolean;
  metadata: (typeof THEME_METADATA)[ThemeVariant];
}

// ============================================================================
// HOOK
// ============================================================================

export function useTheme(): ThemeContextValue {
  const { variant, setVariant, _hasHydrated } = useThemeStore();

  return {
    variant,
    setVariant: async (v: ThemeVariant) => setVariant(v),
    t: variant === 'cosmic' ? CosmicTokens : LinearTokens,
    isCosmic: variant === 'cosmic',
    isLinear: variant === 'linear',
    isLoaded: _hasHydrated,
    metadata: THEME_METADATA[variant],
  };
}

// ============================================================================
// PROVIDER (Deprecated / Pass-through)
// ============================================================================

/**
 * @deprecated The ThemeProvider wrapper is no longer required with Zustand.
 * Returning children directly to avoid breaking existing imports in App.tsx.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default ThemeProvider;

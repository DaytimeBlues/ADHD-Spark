/**
 * ThemeProvider
 * 
 * React Context provider for theme management with AsyncStorage persistence.
 * Provides resolved tokens based on current theme variant.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { LinearTokens } from './linearTokens';
import { CosmicTokens } from './cosmicTokens';
import { 
  ThemeVariant, 
  migrateThemeVariant, 
  DEFAULT_THEME_VARIANT,
  THEME_METADATA 
} from './themeVariant';

// ============================================================================
// CONTEXT TYPE DEFINITION
// ============================================================================

/**
 * Theme context value shape
 */
export interface ThemeContextValue {
  /** Current theme variant */
  variant: ThemeVariant;
  
  /** Set theme variant and persist to storage */
  setVariant: (variant: ThemeVariant) => Promise<void>;
  
  /** Resolved token set for current theme */
  t: typeof LinearTokens;
  
  /** Convenience flag for cosmic theme */
  isCosmic: boolean;
  
  /** Convenience flag for linear theme */
  isLinear: boolean;
  
  /** Whether theme has been loaded from storage */
  isLoaded: boolean;
  
  /** Theme metadata for UI display */
  metadata: typeof THEME_METADATA[ThemeVariant];
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const ThemeContext = createContext<ThemeContextValue | null>(null);

const fallbackThemeContextValue: ThemeContextValue = {
  variant: DEFAULT_THEME_VARIANT,
  setVariant: async () => {},
  t: LinearTokens,
  isCosmic: false,
  isLinear: true,
  isLoaded: true,
  metadata: THEME_METADATA[DEFAULT_THEME_VARIANT],
};

const getStorageService = () => {
  try {
    // Lazy load to avoid test environment AsyncStorage module resolution failures
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('../services/StorageService');
    return mod.default as {
      get: (key: string) => Promise<string | null>;
      set: (key: string, value: string) => Promise<boolean>;
      STORAGE_KEYS: { theme: string };
    };
  } catch {
    return null;
  }
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access theme context
 * Must be used within ThemeProvider
 * 
 * @example
 * function MyComponent() {
 *   const { variant, setVariant, t, isCosmic } = useTheme();
 *   return <View style={{ backgroundColor: t.colors.neutral.darkest }} />;
 * }
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  return context ?? fallbackThemeContextValue;
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Initial variant (defaults to reading from storage) */
  initialVariant?: ThemeVariant;
}

/**
 * Theme Provider Component
 * 
 * Manages theme state with AsyncStorage persistence.
 * Wrap your app with this provider to enable theme switching.
 * 
 * @example
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <NavigationContainer>
 *         {...}
 *       </NavigationContainer>
 *     </ThemeProvider>
 *   );
 * }
 */
export function ThemeProvider({ children, initialVariant }: ThemeProviderProps): JSX.Element {
  // Theme state
  const [variant, setVariantState] = useState<ThemeVariant>(DEFAULT_THEME_VARIANT);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme from storage on mount
  useEffect(() => {
    let isMounted = true;
    
    async function loadTheme() {
      try {
        // Check if initial variant was provided
        if (initialVariant) {
          if (isMounted) {
            setVariantState(initialVariant);
            setIsLoaded(true);
          }
          return;
        }
        
        // Read from storage
        const storageService = getStorageService();
        const storedValue = storageService
          ? await storageService.get(storageService.STORAGE_KEYS.theme)
          : null;
        const resolvedVariant = migrateThemeVariant(storedValue);
        
        if (isMounted) {
          setVariantState(resolvedVariant);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('[ThemeProvider] Failed to load theme:', error);
        if (isMounted) {
          setVariantState(DEFAULT_THEME_VARIANT);
          setIsLoaded(true);
        }
      }
    }
    
    loadTheme();
    
    return () => {
      isMounted = false;
    };
  }, [initialVariant]);

  // Set variant and persist to storage
  const setVariant = useCallback(async (newVariant: ThemeVariant) => {
    try {
      // Update state immediately for responsive UI
      setVariantState(newVariant);
      
      // Persist to storage
      const storageService = getStorageService();
      if (storageService) {
        await storageService.set(storageService.STORAGE_KEYS.theme, newVariant);
      }
    } catch (error) {
      console.error('[ThemeProvider] Failed to save theme:', error);
      // Don't revert state - user sees the change even if persistence fails
    }
  }, []);

  // Resolved tokens based on current variant
  const tokens = useMemo(() => {
    return variant === 'cosmic' ? CosmicTokens : LinearTokens;
  }, [variant]);

  // Convenience flags
  const isCosmic = variant === 'cosmic';
  const isLinear = variant === 'linear';

  // Metadata for current theme
  const metadata = THEME_METADATA[variant];

  // Context value
  const contextValue: ThemeContextValue = useMemo(() => ({
    variant,
    setVariant,
    t: tokens,
    isCosmic,
    isLinear,
    isLoaded,
    metadata,
  }), [variant, setVariant, tokens, isCosmic, isLinear, isLoaded, metadata]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

/**
 * HOC to inject theme props into a component
 * Alternative to useTheme hook for class components
 */
export function withTheme<P extends object>(
  Component: React.ComponentType<P & { theme: ThemeContextValue }>
): React.FC<P> {
  return function WithThemeWrapper(props: P) {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };
}

// ============================================================================
// DEBUG UTILITIES (development only)
// ============================================================================

if (__DEV__) {
  // Expose theme debugging on global object in development
  (globalThis as any).__THEME_DEBUG__ = {
    getVariant: () => {
      try {
        // This will only work if called within a component
        // Useful for debugging in console
        return 'Call useTheme() from within a component';
      } catch {
        return 'Not within ThemeProvider';
      }
    },
    getTokens: () => ({
      linear: LinearTokens,
      cosmic: CosmicTokens,
    }),
  };
}

export default ThemeProvider;

import { useCallback, useMemo } from 'react';
import { THEME_METADATA } from '../../../theme/tokens';
import { useTheme } from '../../../theme/useTheme';
import type { ThemeVariant } from '../../../theme/themeVariant';
import type { ThemeOption } from '../types';

const THEME_ORDER: ThemeVariant[] = ['linear', 'cosmic', 'nightAwe'];

export type UseThemeSwitcherResult = {
  variant: ThemeVariant;
  themeOptions: ThemeOption[];
  selectTheme: (nextVariant: ThemeVariant) => Promise<void>;
};

export const useThemeSwitcher = (): UseThemeSwitcherResult => {
  const { variant, setVariant } = useTheme();

  const selectTheme = useCallback(
    async (nextVariant: ThemeVariant) => {
      await setVariant(nextVariant);
    },
    [setVariant],
  );

  const themeOptions = useMemo<ThemeOption[]>(() => {
    return THEME_ORDER.map((themeVariant) => {
      const metadata = THEME_METADATA[themeVariant];
      return {
        variant: themeVariant,
        label: metadata.label,
        description: metadata.description,
        preview: {
          background: metadata.preview.background,
          accent: metadata.preview.accent,
        },
        selected: variant === themeVariant,
      };
    });
  }, [variant]);

  return {
    variant,
    themeOptions,
    selectTheme,
  };
};

export default useThemeSwitcher;

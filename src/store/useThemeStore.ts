import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '../services/StorageService';
import {
    ThemeVariant,
    DEFAULT_THEME_VARIANT,
} from '../theme/themeVariant';

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

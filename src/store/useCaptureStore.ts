import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '../services/StorageService';
import type { CaptureItem, CaptureStatus } from '../services/CaptureService';

interface CaptureState {
  items: CaptureItem[];
  _hasHydrated: boolean;

  // Computed values / Selectors (conceptually)
  getUnreviewedCount: () => number;
  getItemsByStatus: (status: CaptureStatus) => CaptureItem[];

  // Actions
  addItem: (item: CaptureItem) => void;
  updateItem: (id: string, patch: Partial<CaptureItem>) => void;
  deleteItem: (id: string) => void;
  clearDiscarded: () => void;
  setHasHydrated: (state: boolean) => void;
  checkBankruptcy: () => void;
}

export const useCaptureStore = create<CaptureState>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      getUnreviewedCount: () => {
        return get().items.filter((i) => i.status === 'unreviewed').length;
      },

      getItemsByStatus: (status: CaptureStatus) => {
        return get().items.filter((i) => i.status === status);
      },

      addItem: (item) =>
        set((state) => ({
          items: [item, ...state.items],
        })),

      updateItem: (id, patch) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...patch } : item,
          ),
        })),

      deleteItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      clearDiscarded: () =>
        set((state) => ({
          items: state.items.filter((item) => item.status !== 'discarded'),
        })),

      checkBankruptcy: () =>
        set((state) => {
          const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
          let changed = false;
          const updated = state.items.map((item) => {
            if (item.status === 'unreviewed' && item.createdAt < fourteenDaysAgo) {
              changed = true;
              return { ...item, status: 'discarded' as const };
            }
            return item;
          });
          if (changed) {
            return { items: updated };
          }
          return state;
        }),
    }),
    {
      name: 'captureInbox',
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
          state.checkBankruptcy();
        }
      },
    },
  ),
);

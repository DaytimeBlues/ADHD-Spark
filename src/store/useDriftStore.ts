import { create } from 'zustand';

interface DriftState {
  isVisible: boolean;
  showOverlay: () => void;
  hideOverlay: () => void;
}

export const useDriftStore = create<DriftState>((set) => ({
  isVisible: false,
  showOverlay: () => set({ isVisible: true }),
  hideOverlay: () => set({ isVisible: false }),
}));

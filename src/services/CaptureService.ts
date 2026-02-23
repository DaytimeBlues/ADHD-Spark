/**
 * CaptureService (Zustand Facade)
 *
 * This service has been refactored to act as a middleware over `useCaptureStore`.
 * It maintains the legacy async API signature temporarily to avoid breaking changes,
 * but delegates actual state management and reactivity to Zustand.
 */

import { useCaptureStore } from '../store/useCaptureStore';

export type CaptureSource =
  | 'voice'
  | 'text'
  | 'photo'
  | 'paste'
  | 'meeting'
  | 'checkin';
export type CaptureStatus = 'unreviewed' | 'promoted' | 'discarded';

export interface CaptureItem {
  id: string;
  source: CaptureSource;
  status: CaptureStatus;
  raw: string;
  attachmentUri?: string;
  createdAt: number;
  promotedTo?: 'task' | 'note';
  promotedAt?: number;
  transcript?: string;
  syncError?: string;
}

export type NewCaptureInput = Omit<CaptureItem, 'id' | 'createdAt' | 'status'>;

function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `cap_${ts}_${rand}`;
}

type UnreviewedCountSubscriber = (count: number) => void;

class CaptureServiceClass {
  async getAll(filter?: { status?: CaptureStatus }): Promise<CaptureItem[]> {
    const state = useCaptureStore.getState();
    if (!state._hasHydrated) {
      // Ideally would wait for hydration, but this is a synchronous shim for now
      // Zustand persist usually hydrates before initial render finishes anyway
    }

    if (filter?.status !== undefined) {
      return state.getItemsByStatus(filter.status);
    }
    return state.items;
  }

  async getUnreviewedCount(): Promise<number> {
    return useCaptureStore.getState().getUnreviewedCount();
  }

  async save(input: NewCaptureInput): Promise<CaptureItem> {
    const item: CaptureItem = {
      ...input,
      id: generateId(),
      createdAt: Date.now(),
      status: 'unreviewed',
    };
    useCaptureStore.getState().addItem(item);
    return item;
  }

  async update(id: string, patch: Partial<CaptureItem>): Promise<void> {
    useCaptureStore.getState().updateItem(id, patch);
  }

  async promote(id: string, to: 'task' | 'note'): Promise<void> {
    useCaptureStore.getState().updateItem(id, {
      status: 'promoted',
      promotedTo: to,
      promotedAt: Date.now(),
    });
  }

  async discard(id: string): Promise<void> {
    useCaptureStore.getState().updateItem(id, { status: 'discarded' });
  }

  async delete(id: string): Promise<void> {
    useCaptureStore.getState().deleteItem(id);
  }

  async clearDiscarded(): Promise<void> {
    useCaptureStore.getState().clearDiscarded();
  }

  subscribe(callback: UnreviewedCountSubscriber): () => void {
    const unsub = useCaptureStore.subscribe((state) => {
      callback(state.getUnreviewedCount());
    });
    // Immediately invoke
    callback(useCaptureStore.getState().getUnreviewedCount());
    return unsub;
  }
}

const CaptureService = new CaptureServiceClass();
export default CaptureService;

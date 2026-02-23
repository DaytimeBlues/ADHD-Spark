/**
 * CaptureService
 *
 * Manages the Capture Inbox — the queue of items captured via the Capture Bubble
 * before they are triaged (promoted to task/note or discarded).
 *
 * All captures are saved immediately (offline-first), badge count is reactive
 * via a simple subscriber pattern.
 */

import StorageService from './StorageService';

// ============================================================================
// TYPES
// ============================================================================

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
  /** Raw user input: transcript text, typed text, pasted content, meeting notes */
  raw: string;
  /** Photo attachment URI (photo mode only) */
  attachmentUri?: string;
  /** Unix timestamp (ms) of capture */
  createdAt: number;
  /** What this was promoted to, if promoted */
  promotedTo?: 'task' | 'note';
  /** Unix timestamp (ms) of promotion */
  promotedAt?: number;
  /** AI transcript text (voice mode, set after transcription) */
  transcript?: string;
  /** Error message if offline save or sync failed */
  syncError?: string;
}

export type NewCaptureInput = Omit<CaptureItem, 'id' | 'createdAt' | 'status'>;

// ============================================================================
// STORAGE KEY
// ============================================================================

const CAPTURE_INBOX_KEY = 'captureInbox';

// ============================================================================
// UUID GENERATION
// ============================================================================

function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `cap_${ts}_${rand}`;
}

// ============================================================================
// SUBSCRIBER TYPE
// ============================================================================

type UnreviewedCountSubscriber = (count: number) => void;

// ============================================================================
// SERVICE
// ============================================================================

class CaptureServiceClass {
  private subscribers: Set<UnreviewedCountSubscriber> = new Set();

  // --------------------------------------------------------------------------
  // READS
  // --------------------------------------------------------------------------

  /**
   * Get all capture items. Optionally filter by status.
   */
  async getAll(filter?: { status?: CaptureStatus }): Promise<CaptureItem[]> {
    try {
      const items =
        await StorageService.getJSON<CaptureItem[]>(CAPTURE_INBOX_KEY);
      if (!items) {
        return [];
      }
      if (filter?.status !== undefined) {
        return items.filter((item) => item.status === filter.status);
      }
      return items;
    } catch (error) {
      console.error('[CaptureService] getAll error:', error);
      return [];
    }
  }

  /**
   * Get count of unreviewed items (for badge display).
   */
  async getUnreviewedCount(): Promise<number> {
    try {
      const items = await this.getAll({ status: 'unreviewed' });
      return items.length;
    } catch (error) {
      console.error('[CaptureService] getUnreviewedCount error:', error);
      return 0;
    }
  }

  // --------------------------------------------------------------------------
  // WRITES
  // --------------------------------------------------------------------------

  /**
   * Save a new capture item to the inbox.
   * Assigns id, createdAt, status='unreviewed' automatically.
   * Notifies subscribers after save.
   */
  async save(input: NewCaptureInput): Promise<CaptureItem> {
    const item: CaptureItem = {
      ...input,
      id: generateId(),
      createdAt: Date.now(),
      status: 'unreviewed',
    };

    try {
      const existing = await this.getAll();
      const updated = [item, ...existing]; // newest first
      await StorageService.setJSON(CAPTURE_INBOX_KEY, updated);
      await this.notifySubscribers();
    } catch (error) {
      console.error('[CaptureService] save error:', error);
      // Still return the item — the UI should show a sync error
      item.syncError =
        error instanceof Error ? error.message : 'Unknown storage error';
    }

    return item;
  }

  /**
   * Update an existing item (e.g. to add transcript after recording).
   */
  async update(id: string, patch: Partial<CaptureItem>): Promise<void> {
    try {
      const items = await this.getAll();
      const idx = items.findIndex((item) => item.id === id);
      if (idx === -1) {
        console.error(`[CaptureService] update: item ${id} not found`);
        return;
      }
      items[idx] = { ...items[idx], ...patch };
      await StorageService.setJSON(CAPTURE_INBOX_KEY, items);
      await this.notifySubscribers();
    } catch (error) {
      console.error('[CaptureService] update error:', error);
    }
  }

  /**
   * Promote a capture item to a task or note.
   * Sets status='promoted' and records what it was promoted to.
   */
  async promote(id: string, to: 'task' | 'note'): Promise<void> {
    try {
      await this.update(id, {
        status: 'promoted',
        promotedTo: to,
        promotedAt: Date.now(),
      });
    } catch (error) {
      console.error('[CaptureService] promote error:', error);
    }
  }

  /**
   * Discard a capture item (soft delete — keeps in storage as 'discarded').
   */
  async discard(id: string): Promise<void> {
    try {
      await this.update(id, { status: 'discarded' });
    } catch (error) {
      console.error('[CaptureService] discard error:', error);
    }
  }

  /**
   * Hard-delete a single item. Use sparingly (prefer discard for audit trail).
   */
  async delete(id: string): Promise<void> {
    try {
      const items = await this.getAll();
      const updated = items.filter((item) => item.id !== id);
      await StorageService.setJSON(CAPTURE_INBOX_KEY, updated);
      await this.notifySubscribers();
    } catch (error) {
      console.error('[CaptureService] delete error:', error);
    }
  }

  /**
   * Clear all discarded items (housekeeping).
   */
  async clearDiscarded(): Promise<void> {
    try {
      const items = await this.getAll();
      const kept = items.filter((item) => item.status !== 'discarded');
      await StorageService.setJSON(CAPTURE_INBOX_KEY, kept);
    } catch (error) {
      console.error('[CaptureService] clearDiscarded error:', error);
    }
  }

  // --------------------------------------------------------------------------
  // REACTIVITY
  // --------------------------------------------------------------------------

  /**
   * Subscribe to unreviewed count changes.
   * Returns an unsubscribe function.
   *
   * @example
   * const unsub = CaptureService.subscribe(count => setBadge(count));
   * // In cleanup:
   * unsub();
   */
  subscribe(callback: UnreviewedCountSubscriber): () => void {
    this.subscribers.add(callback);
    // Immediately emit current count
    this.getUnreviewedCount()
      .then((count) => callback(count))
      .catch((err) =>
        console.error('[CaptureService] subscribe init error:', err),
      );

    return () => {
      this.subscribers.delete(callback);
    };
  }

  private async notifySubscribers(): Promise<void> {
    try {
      const count = await this.getUnreviewedCount();
      this.subscribers.forEach((cb) => {
        try {
          cb(count);
        } catch (err) {
          console.error('[CaptureService] subscriber callback error:', err);
        }
      });
    } catch (error) {
      console.error('[CaptureService] notifySubscribers error:', error);
    }
  }
}

const CaptureService = new CaptureServiceClass();
export default CaptureService;

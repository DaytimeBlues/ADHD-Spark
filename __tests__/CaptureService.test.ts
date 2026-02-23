/**
 * CaptureService unit tests
 *
 * Tests CRUD operations, badge count reactivity, and subscriber notifications.
 * StorageService is mocked — no real AsyncStorage.
 */

import CaptureService from '../src/services/CaptureService';
import type {
  CaptureItem,
  NewCaptureInput,
} from '../src/services/CaptureService';

// ============================================================================
// MOCKS
// ============================================================================

const mockGetJSON = jest.fn();
const mockSetJSON = jest.fn();

jest.mock('../src/services/StorageService', () => ({
  __esModule: true,
  default: {
    getJSON: (...args: unknown[]) => mockGetJSON(...args),
    setJSON: (...args: unknown[]) => mockSetJSON(...args),
    STORAGE_KEYS: {
      captureInbox: 'captureInbox',
    },
  },
}));

// ============================================================================
// HELPERS
// ============================================================================

function makeItem(overrides: Partial<CaptureItem> = {}): CaptureItem {
  return {
    id: 'cap_test_1',
    source: 'text',
    status: 'unreviewed',
    raw: 'test capture content',
    createdAt: Date.now(),
    ...overrides,
  };
}

// ============================================================================
// TESTS
// ============================================================================

describe('CaptureService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the private subscribers between tests by re-importing isn't needed;
    // CaptureService is a singleton so subscribers persist — we just clear mocks.
  });

  // --------------------------------------------------------------------------
  // getAll
  // --------------------------------------------------------------------------

  describe('getAll', () => {
    it('returns empty array when storage is null', async () => {
      mockGetJSON.mockResolvedValueOnce(null);

      const result = await CaptureService.getAll();

      expect(result).toEqual([]);
    });

    it('returns all items when no filter is provided', async () => {
      const items = [
        makeItem({ id: 'a', status: 'unreviewed' }),
        makeItem({ id: 'b', status: 'promoted' }),
        makeItem({ id: 'c', status: 'discarded' }),
      ];
      mockGetJSON.mockResolvedValueOnce(items);

      const result = await CaptureService.getAll();

      expect(result).toHaveLength(3);
    });

    it('filters by status when filter is provided', async () => {
      const items = [
        makeItem({ id: 'a', status: 'unreviewed' }),
        makeItem({ id: 'b', status: 'promoted' }),
        makeItem({ id: 'c', status: 'unreviewed' }),
      ];
      mockGetJSON.mockResolvedValueOnce(items);

      const result = await CaptureService.getAll({ status: 'unreviewed' });

      expect(result).toHaveLength(2);
      expect(result.every((item) => item.status === 'unreviewed')).toBe(true);
    });

    it('returns empty array on storage error', async () => {
      mockGetJSON.mockRejectedValueOnce(new Error('storage failure'));

      const result = await CaptureService.getAll();

      expect(result).toEqual([]);
    });
  });

  // --------------------------------------------------------------------------
  // getUnreviewedCount
  // --------------------------------------------------------------------------

  describe('getUnreviewedCount', () => {
    it('returns count of unreviewed items', async () => {
      const items = [
        makeItem({ id: 'a', status: 'unreviewed' }),
        makeItem({ id: 'b', status: 'unreviewed' }),
        makeItem({ id: 'c', status: 'promoted' }),
      ];
      mockGetJSON.mockResolvedValueOnce(items);

      const count = await CaptureService.getUnreviewedCount();

      expect(count).toBe(2);
    });

    it('returns 0 when inbox is empty', async () => {
      mockGetJSON.mockResolvedValueOnce([]);

      const count = await CaptureService.getUnreviewedCount();

      expect(count).toBe(0);
    });
  });

  // --------------------------------------------------------------------------
  // save
  // --------------------------------------------------------------------------

  describe('save', () => {
    it('saves a new item with auto-assigned id, createdAt, and status=unreviewed', async () => {
      mockGetJSON.mockResolvedValueOnce([]); // existing items
      mockSetJSON.mockResolvedValueOnce(undefined);
      // getUnreviewedCount call inside notifySubscribers
      mockGetJSON.mockResolvedValueOnce([]);

      const input: NewCaptureInput = {
        source: 'voice',
        raw: 'pick up the whiteboard markers',
      };

      const item = await CaptureService.save(input);

      expect(item.id).toMatch(/^cap_/);
      expect(item.source).toBe('voice');
      expect(item.raw).toBe('pick up the whiteboard markers');
      expect(item.status).toBe('unreviewed');
      expect(typeof item.createdAt).toBe('number');
      expect(item.syncError).toBeUndefined();
    });

    it('prepends new item to inbox (newest first)', async () => {
      const existing = [makeItem({ id: 'old', createdAt: 1000 })];
      mockGetJSON.mockResolvedValueOnce(existing);
      mockSetJSON.mockResolvedValueOnce(undefined);
      mockGetJSON.mockResolvedValueOnce([]); // notifySubscribers

      const input: NewCaptureInput = {
        source: 'text',
        raw: 'new capture',
      };

      await CaptureService.save(input);

      const savedList = mockSetJSON.mock.calls[0][1] as CaptureItem[];
      expect(savedList[0].raw).toBe('new capture');
      expect(savedList[1].id).toBe('old');
    });

    it('marks syncError on storage failure but still returns item', async () => {
      mockGetJSON.mockResolvedValueOnce([]);
      mockSetJSON.mockRejectedValueOnce(new Error('disk full'));

      const input: NewCaptureInput = {
        source: 'paste',
        raw: 'clipboard content',
      };
      const item = await CaptureService.save(input);

      expect(item.raw).toBe('clipboard content');
      expect(item.syncError).toBeTruthy();
    });
  });

  // --------------------------------------------------------------------------
  // promote
  // --------------------------------------------------------------------------

  describe('promote', () => {
    it('promotes item to task and sets status=promoted', async () => {
      const items = [makeItem({ id: 'cap_1', status: 'unreviewed' })];
      // getAll called twice: once inside update's getAll, once for notifySubscribers
      mockGetJSON.mockResolvedValueOnce(items); // update -> getAll
      mockSetJSON.mockResolvedValueOnce(undefined);
      mockGetJSON.mockResolvedValueOnce([]); // notifySubscribers -> getUnreviewedCount -> getAll

      await CaptureService.promote('cap_1', 'task');

      const saved = mockSetJSON.mock.calls[0][1] as CaptureItem[];
      expect(saved[0].status).toBe('promoted');
      expect(saved[0].promotedTo).toBe('task');
      expect(typeof saved[0].promotedAt).toBe('number');
    });

    it('promotes item to note', async () => {
      const items = [makeItem({ id: 'cap_2', status: 'unreviewed' })];
      mockGetJSON.mockResolvedValueOnce(items);
      mockSetJSON.mockResolvedValueOnce(undefined);
      mockGetJSON.mockResolvedValueOnce([]);

      await CaptureService.promote('cap_2', 'note');

      const saved = mockSetJSON.mock.calls[0][1] as CaptureItem[];
      expect(saved[0].promotedTo).toBe('note');
    });
  });

  // --------------------------------------------------------------------------
  // discard
  // --------------------------------------------------------------------------

  describe('discard', () => {
    it('sets status=discarded on the target item', async () => {
      const items = [makeItem({ id: 'cap_3', status: 'unreviewed' })];
      mockGetJSON.mockResolvedValueOnce(items);
      mockSetJSON.mockResolvedValueOnce(undefined);
      mockGetJSON.mockResolvedValueOnce([]);

      await CaptureService.discard('cap_3');

      const saved = mockSetJSON.mock.calls[0][1] as CaptureItem[];
      expect(saved[0].status).toBe('discarded');
    });
  });

  // --------------------------------------------------------------------------
  // delete
  // --------------------------------------------------------------------------

  describe('delete', () => {
    it('removes the item from storage permanently', async () => {
      const items = [
        makeItem({ id: 'keep_me' }),
        makeItem({ id: 'delete_me' }),
      ];
      mockGetJSON.mockResolvedValueOnce(items);
      mockSetJSON.mockResolvedValueOnce(undefined);
      mockGetJSON.mockResolvedValueOnce([]); // notifySubscribers

      await CaptureService.delete('delete_me');

      const saved = mockSetJSON.mock.calls[0][1] as CaptureItem[];
      expect(saved).toHaveLength(1);
      expect(saved[0].id).toBe('keep_me');
    });
  });

  // --------------------------------------------------------------------------
  // clearDiscarded
  // --------------------------------------------------------------------------

  describe('clearDiscarded', () => {
    it('removes all discarded items and keeps others', async () => {
      const items = [
        makeItem({ id: 'a', status: 'unreviewed' }),
        makeItem({ id: 'b', status: 'discarded' }),
        makeItem({ id: 'c', status: 'promoted' }),
        makeItem({ id: 'd', status: 'discarded' }),
      ];
      mockGetJSON.mockResolvedValueOnce(items);
      mockSetJSON.mockResolvedValueOnce(undefined);

      await CaptureService.clearDiscarded();

      const saved = mockSetJSON.mock.calls[0][1] as CaptureItem[];
      expect(saved).toHaveLength(2);
      expect(saved.every((item) => item.status !== 'discarded')).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // subscribe / notifySubscribers
  // --------------------------------------------------------------------------

  describe('subscribe', () => {
    it('calls subscriber immediately with current unreviewed count', async () => {
      const items = [
        makeItem({ status: 'unreviewed' }),
        makeItem({ id: 'b', status: 'unreviewed' }),
      ];
      mockGetJSON.mockResolvedValueOnce(items); // getAll for getUnreviewedCount

      const callback = jest.fn();
      const unsub = CaptureService.subscribe(callback);

      // Wait for the async initial emit
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(callback).toHaveBeenCalledWith(2);

      unsub();
    });

    it('unsubscribe stops future notifications', async () => {
      mockGetJSON.mockResolvedValue([]);

      const callback = jest.fn();
      const unsub = CaptureService.subscribe(callback);

      // Wait for initial emit
      await new Promise((resolve) => setTimeout(resolve, 10));
      callback.mockClear();

      unsub();

      // Trigger a save — should NOT call the unsubscribed callback
      mockGetJSON.mockResolvedValueOnce([]);
      mockSetJSON.mockResolvedValueOnce(undefined);
      mockGetJSON.mockResolvedValueOnce([]);

      await CaptureService.save({ source: 'text', raw: 'after unsub' });

      expect(callback).not.toHaveBeenCalled();
    });

    it('notifies subscribers after save with updated count', async () => {
      // subscribe initial emit
      mockGetJSON.mockResolvedValueOnce([]);
      const callback = jest.fn();
      const unsub = CaptureService.subscribe(callback);
      await new Promise((resolve) => setTimeout(resolve, 10));
      callback.mockClear();

      // save → notifySubscribers → getUnreviewedCount
      mockGetJSON.mockResolvedValueOnce([]); // save existing
      mockSetJSON.mockResolvedValueOnce(undefined);
      mockGetJSON.mockResolvedValueOnce([makeItem({ status: 'unreviewed' })]); // notifySubscribers

      await CaptureService.save({ source: 'voice', raw: 'meeting note' });
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(callback).toHaveBeenCalledWith(1);

      unsub();
    });
  });
});

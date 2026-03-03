/**
 * CaptureService unit tests
 *
 * Tests the CaptureService Zustand Facade.
 * Mocking the Zustand store to ensure it correctly delegates actions.
 */

import CaptureService from '../src/services/CaptureService';
import { useCaptureStore } from '../src/store/useCaptureStore';
import type {
  CaptureItem,
  NewCaptureInput,
} from '../src/services/CaptureService';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('../src/store/useCaptureStore', () => ({
  useCaptureStore: {
    getState: jest.fn(),
    subscribe: jest.fn(),
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
  let mockState: {
    _hasHydrated: boolean;
    items: CaptureItem[];
    getUnreviewedCount: jest.Mock;
    getItemsByStatus: jest.Mock;
    addItem: jest.Mock;
    updateItem: jest.Mock;
    deleteItem: jest.Mock;
    clearDiscarded: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockState = {
      _hasHydrated: true,
      items: [],
      getUnreviewedCount: jest.fn(() => 0),
      getItemsByStatus: jest.fn((_status: string) => []),
      addItem: jest.fn(),
      updateItem: jest.fn(),
      deleteItem: jest.fn(),
      clearDiscarded: jest.fn(),
    };

    (useCaptureStore.getState as jest.Mock).mockReturnValue(mockState);
  });

  // --------------------------------------------------------------------------
  // getAll
  // --------------------------------------------------------------------------

  describe('getAll', () => {
    it('returns all items when no filter is provided', async () => {
      const items = [makeItem({ id: 'a' })];
      mockState.items = items;

      const result = await CaptureService.getAll();
      expect(result).toEqual(items);
    });

    it('filters by status when filter is provided', async () => {
      const items = [makeItem({ id: 'a', status: 'unreviewed' })];
      mockState.getItemsByStatus.mockReturnValueOnce(items);

      const result = await CaptureService.getAll({ status: 'unreviewed' });
      expect(mockState.getItemsByStatus).toHaveBeenCalledWith('unreviewed');
      expect(result).toEqual(items);
    });
  });

  // --------------------------------------------------------------------------
  // getUnreviewedCount
  // --------------------------------------------------------------------------

  describe('getUnreviewedCount', () => {
    it('returns count of unreviewed items', async () => {
      mockState.getUnreviewedCount.mockReturnValueOnce(5);
      const count = await CaptureService.getUnreviewedCount();
      expect(count).toBe(5);
      expect(mockState.getUnreviewedCount).toHaveBeenCalled();
    });
  });

  // --------------------------------------------------------------------------
  // save
  // --------------------------------------------------------------------------

  describe('save', () => {
    it('creates a new item and calls addItem on store', async () => {
      const input: NewCaptureInput = {
        source: 'voice',
        raw: 'test voice note',
      };

      const item = await CaptureService.save(input);

      expect(item.id).toMatch(/^cap_/);
      expect(item.status).toBe('unreviewed');
      expect(item.raw).toBe('test voice note');

      expect(mockState.addItem).toHaveBeenCalledWith(item);
    });
  });

  // --------------------------------------------------------------------------
  // update / promote / discard / delete
  // --------------------------------------------------------------------------

  describe('mutations', () => {
    it('update calls updateItem', async () => {
      await CaptureService.update('123', { transcript: 'hello' });
      expect(mockState.updateItem).toHaveBeenCalledWith('123', {
        transcript: 'hello',
      });
    });

    it('promote calls updateItem with promoted status and timestamp', async () => {
      await CaptureService.promote('cap_1', 'task');
      expect(mockState.updateItem).toHaveBeenCalledWith(
        'cap_1',
        expect.objectContaining({
          status: 'promoted',
          promotedTo: 'task',
          promotedAt: expect.any(Number),
        }),
      );
    });

    it('discard calls updateItem with discarded status', async () => {
      await CaptureService.discard('cap_3');
      expect(mockState.updateItem).toHaveBeenCalledWith('cap_3', {
        status: 'discarded',
      });
    });

    it('delete calls deleteItem', async () => {
      await CaptureService.delete('delete_me');
      expect(mockState.deleteItem).toHaveBeenCalledWith('delete_me');
    });

    it('clearDiscarded calls clearDiscarded on store', async () => {
      await CaptureService.clearDiscarded();
      expect(mockState.clearDiscarded).toHaveBeenCalled();
    });
  });

  // --------------------------------------------------------------------------
  // subscribe
  // --------------------------------------------------------------------------

  describe('subscribe', () => {
    it('subscribes to useCaptureStore and passes count', () => {
      const mockUnsub = jest.fn();
      (useCaptureStore.subscribe as jest.Mock).mockReturnValue(mockUnsub);
      mockState.getUnreviewedCount.mockReturnValue(3);

      const callback = jest.fn();
      const unsub = CaptureService.subscribe(callback);

      // It should immediately invoke callback with current count
      expect(callback).toHaveBeenCalledWith(3);

      // It should subscribe to changes
      expect(useCaptureStore.subscribe).toHaveBeenCalled();

      // The callback passed to useCaptureStore.subscribe should trigger our callback when store answers
      const storeListener = (useCaptureStore.subscribe as jest.Mock).mock
        .calls[0][0];

      // simulate state change
      storeListener(mockState);
      expect(callback).toHaveBeenCalledTimes(2); // 1 for init, 1 for update

      // Ensure unsub works
      unsub();
      expect(mockUnsub).toHaveBeenCalled();
    });
  });
});

import GoogleTasksSyncService from '../src/services/GoogleTasksSyncService.web';
import type { SortedItem } from '../src/services/AISortService';

describe('GoogleTasksSyncService.web', () => {
  it('returns auth required for sorted item sync on web', async () => {
    const result = await GoogleTasksSyncService.syncSortedItemsToGoogle([
      { text: 'Task', category: 'task', priority: 'high' } as SortedItem,
    ]);

    expect(result.authRequired).toBe(true);
    expect(result.skippedCount).toBe(1);
  });

  it('returns empty brain dump sync result', async () => {
    const result = await GoogleTasksSyncService.syncToBrainDump();

    expect(result.importedCount).toBe(0);
    expect(result.syncTokenUpdated).toBe(false);
  });
});

jest.mock('../src/services/StorageService', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn().mockResolvedValue(true),
    STORAGE_KEYS: {
      streakCount: 'streakCount',
      lastUseDate: 'lastUseDate',
      retentionGraceWindowStart: 'retentionGraceWindowStart',
      retentionGraceDaysUsed: 'retentionGraceDaysUsed',
    },
  },
}));

import RetentionService from '../src/services/RetentionService';
import StorageService from '../src/services/StorageService';

describe('RetentionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts streak at 1 for first app use', async () => {
    (StorageService.get as jest.Mock).mockResolvedValue(null);

    const streak = await RetentionService.markAppUse(
      new Date('2026-02-20T00:00:00Z'),
    );

    expect(streak).toBe(1);
    expect(StorageService.set).toHaveBeenCalledWith('streakCount', '1');
  });

  it('increments streak for consecutive day use', async () => {
    (StorageService.get as jest.Mock).mockImplementation((key: string) => {
      const values: Record<string, string> = {
        lastUseDate: '2026-02-19',
        streakCount: '2',
        retentionGraceWindowStart: '2026-02-18',
        retentionGraceDaysUsed: '0',
      };
      return Promise.resolve(values[key] ?? null);
    });

    const streak = await RetentionService.markAppUse(
      new Date('2026-02-20T00:00:00Z'),
    );

    expect(streak).toBe(3);
    expect(StorageService.set).toHaveBeenCalledWith('streakCount', '3');
  });

  it('returns gentle restart after a short lapse', async () => {
    (StorageService.get as jest.Mock).mockResolvedValue('2026-02-18');

    const level = await RetentionService.getReentryPromptLevel(
      new Date('2026-02-20T00:00:00Z'),
    );

    expect(level).toBe('gentle_restart');
  });

  it('returns none when no last-use date exists', async () => {
    (StorageService.get as jest.Mock).mockResolvedValue(null);

    const level = await RetentionService.getReentryPromptLevel(
      new Date('2026-02-20T00:00:00Z'),
    );

    expect(level).toBe('none');
  });
});

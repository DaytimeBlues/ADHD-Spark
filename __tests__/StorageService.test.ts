import AsyncStorage from '@react-native-async-storage/async-storage';
import RetentionService from '../src/services/RetentionService';
import StorageService from '../src/services/StorageService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
}));

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('setJSON stringifies values', async () => {
    const payload = { count: 2, items: ['a', 'b'] };
    await StorageService.setJSON('test-key', payload);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify(payload),
    );
  });

  it('getJSON parses values', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({ ok: true }),
    );

    const result = await StorageService.getJSON<{ ok: boolean }>('test-key');
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('test-key');
    expect(result).toEqual({ ok: true });
  });

  it('getJSON returns null when storage is empty', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const result = await StorageService.getJSON('empty-key');
    expect(result).toBeNull();
  });

  it('getJSON returns null for invalid JSON', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('{not-json');

    const result = await StorageService.getJSON('test-key');
    expect(result).toBeNull();
  });

  it('get returns null on storage error', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
      new Error('fail'),
    );

    const result = await StorageService.get('test-key');
    expect(result).toBeNull();
  });

  it('set returns false on storage error', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
      new Error('fail'),
    );

    const result = await StorageService.set('test-key', 'value');
    expect(result).toBe(false);
  });

  it('remove returns false on storage error', async () => {
    (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(
      new Error('fail'),
    );

    const result = await StorageService.remove('test-key');
    expect(result).toBe(false);
  });

  it('remove returns true on success', async () => {
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValueOnce(null);

    const result = await StorageService.remove('test-key');
    expect(result).toBe(true);
  });

  it('setJSON returns false when JSON serialization fails', async () => {
    const circular: { self?: unknown } = {};
    circular.self = circular;

    const result = await StorageService.setJSON('test-key', circular);
    expect(result).toBe(false);
  });
});

describe('RetentionService grace-day behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('preserves streak with one grace day in active window', async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce('2026-02-14')
      .mockResolvedValueOnce('4')
      .mockResolvedValueOnce('2026-02-10')
      .mockResolvedValueOnce('0');

    const result = await RetentionService.markAppUse(
      new Date('2026-02-16T00:00:00Z'),
    );

    expect(result).toBe(5);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('streakCount', '5');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'retentionGraceDaysUsed',
      '1',
    );
  });

  it('resets streak when grace day already used', async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce('2026-02-14')
      .mockResolvedValueOnce('7')
      .mockResolvedValueOnce('2026-02-10')
      .mockResolvedValueOnce('1');

    const result = await RetentionService.markAppUse(
      new Date('2026-02-16T00:00:00Z'),
    );

    expect(result).toBe(1);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('streakCount', '1');
  });
});

describe('StorageService (native SQLite path)', () => {
  const originalJestWorkerId = process.env.JEST_WORKER_ID;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const loadNativeStorageService = (
    configureAsyncStorage?: (mock: {
      getItem: jest.Mock;
      setItem: jest.Mock;
      removeItem: jest.Mock;
      getAllKeys: jest.Mock;
      multiGet: jest.Mock;
    }) => void,
    sqliteOpenImpl?: () => {
      execute: jest.Mock;
      transaction: jest.Mock;
    },
  ) => {
    jest.resetModules();
    process.env.JEST_WORKER_ID = '';

    const executeMock = jest.fn(async (_sql: string, _params?: unknown[]) => ({
      rows: [],
    }));
    const transactionMock = jest.fn(
      async (cb: (tx: { execute: typeof executeMock }) => Promise<void>) => {
        await cb({ execute: executeMock });
      },
    );

    jest.doMock('react-native', () => ({
      Platform: { OS: 'android' },
    }));

    jest.doMock('@op-engineering/op-sqlite', () => {
      return {
        open: jest.fn(
          sqliteOpenImpl ||
            (() => ({
              execute: executeMock,
              transaction: transactionMock,
            })),
        ),
      };
    });

    const asyncStorageMock =
      require('@react-native-async-storage/async-storage') as {
        getItem: jest.Mock;
        setItem: jest.Mock;
        removeItem: jest.Mock;
        getAllKeys: jest.Mock;
        multiGet: jest.Mock;
      };

    configureAsyncStorage?.(asyncStorageMock);

    const module = require('../src/services/StorageService') as {
      default: typeof StorageService;
      zustandStorage: {
        getItem: (name: string) => Promise<string | null>;
        setItem: (name: string, value: string) => Promise<void>;
        removeItem: (name: string) => Promise<void>;
      };
    };
    return {
      StorageService: module.default,
      zustandStorage: module.zustandStorage,
      executeMock,
      transactionMock,
    };
  };

  afterEach(() => {
    process.env.JEST_WORKER_ID = originalJestWorkerId;
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('initializes SQLite table and marks migration complete', async () => {
    const { StorageService: nativeStorageService, executeMock } =
      loadNativeStorageService((asyncStorageMock) => {
        asyncStorageMock.getItem.mockResolvedValueOnce(null);
        asyncStorageMock.getAllKeys.mockResolvedValueOnce(['a']);
        asyncStorageMock.multiGet.mockResolvedValueOnce([['a', '1']]);
        asyncStorageMock.setItem.mockResolvedValueOnce(null);
      });

    await nativeStorageService.init();

    expect(executeMock).toHaveBeenCalledWith(
      'CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value TEXT)',
    );
  });

  it('reads value from SQLite store', async () => {
    const { StorageService: nativeStorageService, executeMock } =
      loadNativeStorageService();
    executeMock.mockResolvedValueOnce({ rows: [{ value: 'hello' }] });

    const value = await nativeStorageService.get('k');

    expect(value).toBe('hello');
  });

  it('writes and removes values in SQLite store', async () => {
    const { StorageService: nativeStorageService, executeMock } =
      loadNativeStorageService();

    const setOk = await nativeStorageService.set('k', 'v');
    const removeOk = await nativeStorageService.remove('k');

    expect(setOk).toBe(true);
    expect(removeOk).toBe(true);
    expect(executeMock).toHaveBeenCalledWith(
      'INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)',
      ['k', 'v'],
    );
    expect(executeMock).toHaveBeenCalledWith(
      'DELETE FROM kv_store WHERE key = ?',
      ['k'],
    );
  });

  it('returns null/false when SQLite operations fail', async () => {
    const { StorageService: nativeStorageService, executeMock } =
      loadNativeStorageService();
    executeMock.mockRejectedValue(new Error('sqlite failed'));

    await expect(nativeStorageService.get('k')).resolves.toBeNull();
    await expect(nativeStorageService.set('k', 'v')).resolves.toBe(false);
    await expect(nativeStorageService.remove('k')).resolves.toBe(false);
  });

  it('returns null for getJSON when get throws unexpectedly', async () => {
    const { StorageService: nativeStorageService } = loadNativeStorageService();
    jest
      .spyOn(nativeStorageService, 'get')
      .mockRejectedValueOnce(new Error('unexpected'));

    await expect(nativeStorageService.getJSON('k')).resolves.toBeNull();
  });

  it('handles missing SQLite db initialization safely', async () => {
    const { StorageService: nativeStorageService } = loadNativeStorageService(
      undefined,
      () => {
        return undefined as unknown as {
          execute: jest.Mock;
          transaction: jest.Mock;
        };
      },
    );

    await expect(nativeStorageService.get('k')).resolves.toBeNull();
  });

  it('runs migration path in web/jest init', async () => {
    await StorageService.init();
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('storageVersion');
  });

  it('handles migration errors in web/jest init without throwing', async () => {
    jest.spyOn(StorageService, 'get').mockRejectedValueOnce(new Error('boom'));

    await expect(StorageService.init()).resolves.toBeUndefined();
  });

  it('handles AsyncStorage->SQLite migration failures gracefully', async () => {
    const { StorageService: nativeStorageService } = loadNativeStorageService(
      (asyncStorageMock) => {
        asyncStorageMock.getItem.mockResolvedValueOnce(null);
        asyncStorageMock.getAllKeys.mockRejectedValueOnce(
          new Error('keys fail'),
        );
      },
    );

    await expect(nativeStorageService.init()).resolves.toBeUndefined();
  });

  it('zustandStorage delegates to StorageService async APIs', async () => {
    const { StorageService: nativeStorageService, zustandStorage } =
      loadNativeStorageService();
    const getSpy = jest
      .spyOn(nativeStorageService, 'get')
      .mockResolvedValueOnce('persisted');
    const setSpy = jest
      .spyOn(nativeStorageService, 'set')
      .mockResolvedValueOnce(true);
    const removeSpy = jest
      .spyOn(nativeStorageService, 'remove')
      .mockResolvedValueOnce(true);

    await expect(zustandStorage.getItem('x')).resolves.toBe('persisted');
    await expect(zustandStorage.setItem('x', 'y')).resolves.toBeUndefined();
    await expect(zustandStorage.removeItem('x')).resolves.toBeUndefined();

    expect(getSpy).toHaveBeenCalledWith('x');
    expect(setSpy).toHaveBeenCalledWith('x', 'y');
    expect(removeSpy).toHaveBeenCalledWith('x');
  });
});

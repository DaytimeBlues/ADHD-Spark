import AsyncStorage from '@react-native-async-storage/async-storage';
import RetentionService from '../src/services/RetentionService';
import StorageService from '../src/services/StorageService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
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

import AISortService, { AiSortError } from '../../src/services/AISortService';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const SORTED_RESPONSE = {
  sorted: [
    { text: 'Buy milk', category: 'task', priority: 'high' },
    { text: 'Call dentist', category: 'reminder', priority: 'medium' },
  ],
};

// Use a very short timeout so AbortController doesn't hang tests
jest.mock('../../src/config', () => ({
  config: {
    apiBaseUrl: 'https://test.example.com',
    aiTimeout: 100,
    aiMaxRetries: 0,
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  AISortService.clearCache();
});

describe('AISortService.sortItems', () => {
  it('returns empty array for empty input', async () => {
    const result = await AISortService.sortItems([]);
    expect(result).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns sorted items on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => SORTED_RESPONSE,
    });

    const result = await AISortService.sortItems(['Buy milk', 'Call dentist']);
    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('Buy milk');
  });

  it('returns cached result without re-fetching', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => SORTED_RESPONSE,
    });

    const items = ['Buy milk', 'Call dentist'];
    await AISortService.sortItems(items);
    const second = await AISortService.sortItems(items);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(second).toHaveLength(2);
  });

  it('does not use cache after clearCache()', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => SORTED_RESPONSE,
    });

    const items = ['Buy milk'];
    await AISortService.sortItems(items);
    AISortService.clearCache();
    await AISortService.sortItems(items);

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('throws AI_NETWORK error on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('Failed to fetch'));

    const err = await AISortService.sortItems(['a']).catch((e) => e);
    expect(err).toBeInstanceOf(AiSortError);
    expect(err.code).toBe('AI_NETWORK');
  });

  it('throws AI_TIMEOUT error when aborted', async () => {
    const abortError = Object.assign(new Error('Aborted'), {
      name: 'AbortError',
    });
    mockFetch.mockRejectedValue(abortError);

    const err = await AISortService.sortItems(['a']).catch((e) => e);
    expect(err).toBeInstanceOf(AiSortError);
    expect(err.code).toBe('AI_TIMEOUT');
  });

  it('throws AI_INVALID_RESPONSE for bad schema', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ wrong: 'data' }),
    });

    const err = await AISortService.sortItems(['a']).catch((e) => e);
    expect(err).toBeInstanceOf(AiSortError);
    expect(err.code).toBe('AI_INVALID_RESPONSE');
  });

  it('throws AI_SERVER_ERROR for non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Rate limit hit' }),
    });

    const err = await AISortService.sortItems(['a']).catch((e) => e);
    expect(err).toBeInstanceOf(AiSortError);
    expect(err.code).toBe('AI_SERVER_ERROR');
  });
});

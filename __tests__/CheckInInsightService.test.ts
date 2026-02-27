import CheckInInsightService from '../src/services/CheckInInsightService';
import StorageService from '../src/services/StorageService';

jest.mock('../src/services/StorageService', () => ({
  __esModule: true,
  default: {
    getJSON: jest.fn(),
    setJSON: jest.fn().mockResolvedValue(true),
  },
}));

describe('CheckInInsightService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when no entries provided', async () => {
    const result = await CheckInInsightService.generateInsight([]);
    expect(result).toBeNull();
  });

  it('returns cached insight when still fresh', async () => {
    (StorageService.getJSON as jest.Mock).mockResolvedValueOnce({
      text: 'cached insight',
      generatedAt: Date.now(),
    });

    const result = await CheckInInsightService.generateInsight([
      { timestamp: Date.now(), mood: 'ok', energy: 3 },
    ]);

    expect(result?.text).toBe('cached insight');
  });

  it('generates and caches insight from API response', async () => {
    (StorageService.getJSON as jest.Mock).mockResolvedValueOnce(null);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ insight: 'you are trending up' }),
    } as unknown as Response);

    const result = await CheckInInsightService.generateInsight([
      { timestamp: Date.now(), mood: 'good', energy: 4 },
    ]);

    expect(result?.text).toBe('you are trending up');
    expect(StorageService.setJSON).toHaveBeenCalled();
  });
});

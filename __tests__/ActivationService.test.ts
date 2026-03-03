import ActivationService from '../src/services/ActivationService';

const mockGetJSON = jest.fn();
const mockSetJSON = jest.fn();
const mockRemove = jest.fn();

jest.mock('../src/services/StorageService', () => ({
  __esModule: true,
  default: {
    getJSON: (...args: unknown[]) => mockGetJSON(...args),
    setJSON: (...args: unknown[]) => mockSetJSON(...args),
    remove: (...args: unknown[]) => mockRemove(...args),
    STORAGE_KEYS: {
      activationSessions: 'activationSessions',
      activationPendingStart: 'activationPendingStart',
      lastActiveSession: 'lastActiveSession',
    },
  },
}));

describe('ActivationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts session and persists it', async () => {
    mockGetJSON.mockResolvedValueOnce([]);

    const sessionId = await ActivationService.startSession('ignite');

    expect(sessionId).toBeTruthy();
    expect(mockSetJSON).toHaveBeenCalledWith(
      'activationSessions',
      expect.arrayContaining([
        expect.objectContaining({
          id: sessionId,
          source: 'ignite',
          status: 'started',
        }),
      ]),
    );
  });

  it('consumes pending start payload once', async () => {
    mockGetJSON.mockResolvedValueOnce({
      source: 'fogcutter_handoff',
      requestedAt: '2026-02-16T00:00:00.000Z',
    });

    const pending = await ActivationService.consumePendingStart();

    expect(pending?.source).toBe('fogcutter_handoff');
    expect(mockRemove).toHaveBeenCalledWith('activationPendingStart');
  });

  it('returns 7-day summary metrics', async () => {
    const now = Date.now();
    mockGetJSON.mockResolvedValueOnce([
      {
        id: '1',
        startedAt: new Date(now - 60_000).toISOString(),
        status: 'completed',
        source: 'ignite',
      },
      {
        id: '2',
        startedAt: new Date(now - 120_000).toISOString(),
        status: 'abandoned',
        source: 'ignite',
      },
      {
        id: '3',
        startedAt: new Date(now - 180_000).toISOString(),
        status: 'resumed',
        source: 'fogcutter_handoff',
      },
    ]);

    const summary = await ActivationService.getSummary(7);

    expect(summary.started).toBe(3);
    expect(summary.completed).toBe(1);
    expect(summary.abandoned).toBe(1);
    expect(summary.resumed).toBe(1);
    expect(summary.completionRate).toBeCloseTo(1 / 3, 3);
  });

  it('returns daily trend points for trailing window', async () => {
    const now = Date.now();
    const today = new Date(now).toISOString();
    const yesterday = new Date(now - 24 * 60 * 60 * 1000).toISOString();

    mockGetJSON.mockResolvedValueOnce([
      {
        id: '1',
        startedAt: today,
        status: 'completed',
        source: 'ignite',
      },
      {
        id: '2',
        startedAt: today,
        status: 'abandoned',
        source: 'ignite',
      },
      {
        id: '3',
        startedAt: yesterday,
        status: 'completed',
        source: 'checkin_prompt',
      },
    ]);

    const trend = await ActivationService.getDailyTrend(2);

    expect(trend).toHaveLength(2);
    expect(trend[0].started).toBe(1);
    expect(trend[0].completed).toBe(1);
    expect(trend[1].started).toBe(2);
    expect(trend[1].completed).toBe(1);
  });

  it('persists lastActiveSession on startSession', async () => {
    mockGetJSON.mockResolvedValueOnce([]);

    const sessionId = await ActivationService.startSession('ignite');

    expect(mockSetJSON).toHaveBeenCalledWith('lastActiveSession', {
      id: sessionId,
      source: 'ignite',
      startedAt: expect.any(String),
      status: 'started',
    });
  });

  it('updates lastActiveSession status on completion', async () => {
    const existingSession = {
      id: 'session-123',
      startedAt: '2026-02-16T00:00:00.000Z',
      status: 'started',
      source: 'ignite',
    };

    mockGetJSON.mockResolvedValueOnce([existingSession]);
    mockGetJSON.mockResolvedValueOnce(existingSession);

    await ActivationService.updateSessionStatus('session-123', 'completed');

    expect(mockSetJSON).toHaveBeenCalledWith('lastActiveSession', {
      id: 'session-123',
      source: 'ignite',
      startedAt: '2026-02-16T00:00:00.000Z',
      status: 'completed',
      endedAt: expect.any(String),
    });
  });

  it('updates lastActiveSession status on resumed', async () => {
    const existingSession = {
      id: 'session-456',
      startedAt: '2026-02-16T00:00:00.000Z',
      status: 'started',
      source: 'ignite',
    };

    mockGetJSON.mockResolvedValueOnce([existingSession]);
    mockGetJSON.mockResolvedValueOnce(existingSession);

    await ActivationService.updateSessionStatus('session-456', 'resumed');

    expect(mockSetJSON).toHaveBeenCalledWith('lastActiveSession', {
      id: 'session-456',
      source: 'ignite',
      startedAt: '2026-02-16T00:00:00.000Z',
      status: 'resumed',
    });
  });
});

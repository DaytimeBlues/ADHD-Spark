jest.mock('../src/services/StorageService', () => ({
  __esModule: true,
  default: {
    getJSON: jest.fn(),
    setJSON: jest.fn(),
    STORAGE_KEYS: {
      uxMetricsEvents: 'uxMetricsEvents',
    },
  },
}));

import StorageService from '../src/services/StorageService';
import UXMetricsService from '../src/services/UXMetricsService';

describe('UXMetricsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (StorageService.getJSON as jest.Mock).mockResolvedValue([]);
    (StorageService.setJSON as jest.Mock).mockResolvedValue(true);
  });

  it('tracks and stores a new event', async () => {
    await UXMetricsService.track('opened_screen', { screen: 'home' });

    expect(StorageService.setJSON).toHaveBeenCalledWith(
      'uxMetricsEvents',
      expect.arrayContaining([
        expect.objectContaining({
          name: 'opened_screen',
          metadata: { screen: 'home' },
        }),
      ]),
    );
  });

  it('caps stored events at 200 records', async () => {
    const existing = Array.from({ length: 200 }, (_, index) => ({
      name: `event_${index}`,
      timestamp: '2026-01-01T00:00:00.000Z',
    }));
    (StorageService.getJSON as jest.Mock).mockResolvedValue(existing);

    await UXMetricsService.track('latest_event');

    const payload = (StorageService.setJSON as jest.Mock).mock.calls[0][1];
    expect(payload).toHaveLength(200);
    expect(payload[0]).toEqual(
      expect.objectContaining({ name: 'latest_event' }),
    );
  });

  it('swallows errors and logs warning when tracking fails', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    (StorageService.getJSON as jest.Mock).mockRejectedValue(new Error('fail'));

    await UXMetricsService.track('broken_event');

    expect(warnSpy).toHaveBeenCalledWith(
      'UXMetricsService.track failed:',
      expect.any(Error),
    );
    warnSpy.mockRestore();
  });
});

import { config } from '../src/config';
import { GooglePollingService } from '../src/services/google-sync/GooglePollingService';
import { LoggerService } from '../src/services/LoggerService';

const mockFetch = jest.fn();
const mockAddEventListener = jest.fn();

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: (...args: unknown[]) => mockFetch(...args),
    addEventListener: (...args: unknown[]) => mockAddEventListener(...args),
  },
}));

jest.mock('../src/services/LoggerService', () => ({
  LoggerService: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  withOperationContext: (value: unknown) => value,
}));

describe('GooglePollingService', () => {
  const syncToBrainDump = jest.fn().mockResolvedValue(undefined);
  const processOfflineQueue = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    config.googleWebClientId = 'web-client-id';
    config.googleIosClientId = 'ios-client-id';
    mockFetch.mockResolvedValue({ isConnected: true });
    mockAddEventListener.mockReturnValue(jest.fn());
  });

  it('does not attach listeners when Google client IDs are missing', () => {
    config.googleWebClientId = undefined;
    config.googleIosClientId = undefined;
    const service = new GooglePollingService({
      isWeb: false,
      syncToBrainDump,
      processOfflineQueue,
    });

    service.startForegroundPolling();

    expect(mockAddEventListener).not.toHaveBeenCalled();
  });

  it('suppresses startup noise for initial online listener callbacks', () => {
    const service = new GooglePollingService({
      isWeb: false,
      syncToBrainDump,
      processOfflineQueue,
    });

    service.startForegroundPolling();
    const listener = mockAddEventListener.mock.calls[0][0];
    listener({ isConnected: true });
    listener({ isConnected: true });

    expect(LoggerService.info).not.toHaveBeenCalledWith(
      expect.objectContaining({
        operation: 'NetInfoListener',
      }),
    );
    expect(syncToBrainDump).not.toHaveBeenCalled();
  });

  it('logs and syncs when connectivity transitions from offline to online', () => {
    const service = new GooglePollingService({
      isWeb: false,
      syncToBrainDump,
      processOfflineQueue,
    });

    service.startForegroundPolling();
    const listener = mockAddEventListener.mock.calls[0][0];
    listener({ isConnected: false });
    listener({ isConnected: true });

    expect(LoggerService.info).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: 'NetInfoListener',
      }),
    );
    expect(syncToBrainDump).toHaveBeenCalled();
    expect(processOfflineQueue).toHaveBeenCalled();
  });
});

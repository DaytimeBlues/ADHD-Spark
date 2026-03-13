const mockStorageInit = jest.fn();
const mockBiometricInit = jest.fn();
const mockSyncToBrainDump = jest.fn();
const mockWebMcpInit = jest.fn();
const mockCheckInStart = jest.fn();
const mockDriftInit = jest.fn();
const mockLoggerWarn = jest.fn();
const mockLoggerError = jest.fn();

jest.mock('../src/services/StorageService', () => ({
  __esModule: true,
  default: {
    init: () => mockStorageInit(),
  },
}));

jest.mock('../src/services/BiometricService', () => ({
  BiometricService: {
    init: () => mockBiometricInit(),
  },
}));

jest.mock('../src/services/GoogleTasksSyncService', () => ({
  GoogleTasksSyncService: {
    syncToBrainDump: (...args: unknown[]) => mockSyncToBrainDump(...args),
  },
}));

jest.mock('../src/services/WebMCPService', () => ({
  __esModule: true,
  default: {
    init: () => mockWebMcpInit(),
  },
}));

jest.mock('../src/services/CheckInService', () => ({
  CheckInService: {
    start: () => mockCheckInStart(),
  },
}));

jest.mock('../src/services/DriftService', () => ({
  DriftService: {
    init: () => mockDriftInit(),
  },
}));

jest.mock('../src/services/LoggerService', () => ({
  LoggerService: {
    warn: (...args: unknown[]) => mockLoggerWarn(...args),
    error: (...args: unknown[]) => mockLoggerError(...args),
    fatal: jest.fn(),
  },
  withOperationContext: (value: unknown) => value,
}));

jest.mock('../src/config', () => ({
  config: {
    startupWarnings: [],
    startupErrors: [],
    googleWebClientId: undefined,
    googleIosClientId: undefined,
  },
}));

describe('bootstrapApp', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockStorageInit.mockResolvedValue(undefined);
    mockBiometricInit.mockResolvedValue(undefined);
    mockSyncToBrainDump.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not start Google sync when Google client IDs are missing', async () => {
    const { bootstrapApp } =
      require('../src/init/bootstrap') as typeof import('../src/init/bootstrap');

    await bootstrapApp();

    expect(mockSyncToBrainDump).not.toHaveBeenCalled();
    expect(mockCheckInStart).toHaveBeenCalled();
    expect(mockDriftInit).toHaveBeenCalled();
  });

  it('cancels the timeout warning when critical init resolves before the deadline', async () => {
    jest.useFakeTimers();
    const { bootstrapApp } =
      require('../src/init/bootstrap') as typeof import('../src/init/bootstrap');

    const resultPromise = bootstrapApp();
    await jest.runAllTicks();
    await Promise.resolve();
    await Promise.resolve();
    const result = await resultPromise;
    jest.advanceTimersByTime(9000);

    expect(result.success).toBe(true);
    expect(mockLoggerWarn).not.toHaveBeenCalledWith(
      expect.objectContaining({
        service: 'bootstrap',
        operation: 'bootstrapApp',
      }),
    );
  });
});

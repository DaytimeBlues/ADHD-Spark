export {};

const mockAuthenticateAsync = jest.fn();
const mockHasHardwareAsync = jest.fn();
const mockIsEnrolledAsync = jest.fn();
const mockAddEventListener = jest.fn(() => ({ remove: jest.fn() }));

jest.mock('expo-local-authentication', () => ({
  authenticateAsync: mockAuthenticateAsync,
  hasHardwareAsync: mockHasHardwareAsync,
  isEnrolledAsync: mockIsEnrolledAsync,
}));

jest.mock('../src/services/StorageService', () => ({
  __esModule: true,
  default: {
    getJSON: jest.fn(),
    setJSON: jest.fn(),
  },
}));

describe('BiometricService', () => {
  let BiometricService: typeof import('../src/services/BiometricService').BiometricService;
  let StorageService: typeof import('../src/services/StorageService').default;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    jest.doMock('react-native', () => ({
      AppState: {
        addEventListener: mockAddEventListener,
      },
    }));

    StorageService = require('../src/services/StorageService').default;
    BiometricService =
      require('../src/services/BiometricService').BiometricService;

    (StorageService.getJSON as jest.Mock).mockResolvedValue(false);
    (StorageService.setJSON as jest.Mock).mockResolvedValue(true);
    mockHasHardwareAsync.mockResolvedValue(true);
    mockIsEnrolledAsync.mockResolvedValue(true);
    mockAuthenticateAsync.mockResolvedValue({ success: true });
  });

  it('subscribes to app state on construction', () => {
    expect(mockAddEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );
  });

  it('loads security flag during init', async () => {
    await BiometricService.init();

    expect(StorageService.getJSON).toHaveBeenCalledWith('isBiometricSecured');
    expect(BiometricService.getIsSecured()).toBe(false);
  });

  it('returns false when enabling security without biometric support', async () => {
    mockHasHardwareAsync.mockResolvedValue(false);

    const result = await BiometricService.toggleSecurity(true);

    expect(result).toBe(false);
    expect(StorageService.setJSON).not.toHaveBeenCalled();
  });

  it('authenticates successfully when secured', async () => {
    await BiometricService.toggleSecurity(true);

    const result = await BiometricService.authenticate('Unlock test');

    expect(result).toBe(true);
    expect(mockAuthenticateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ promptMessage: 'Unlock test' }),
    );
  });

  it('returns true immediately when app is not secured', async () => {
    await BiometricService.toggleSecurity(false);

    const result = await BiometricService.authenticate();

    expect(result).toBe(true);
    expect(mockAuthenticateAsync).not.toHaveBeenCalled();
  });
});

const createGoogleSigninMock = () => ({
  configure: jest.fn(),
  hasPlayServices: jest.fn(),
  signIn: jest.fn(),
  signInSilently: jest.fn(),
  getTokens: jest.fn(),
  getCurrentUser: jest.fn(),
});

type GoogleModuleMode = 'normal' | 'missing' | 'throw';

const loadGoogleAuthService = (
  isWeb: boolean,
  googleModuleMode: GoogleModuleMode = 'normal',
) => {
  jest.resetModules();
  const googleSigninMock = createGoogleSigninMock();
  const loggerWarn = jest.fn();
  const loggerError = jest.fn();

  jest.doMock('../src/utils/PlatformUtils', () => ({
    __esModule: true,
    isWeb,
  }));

  jest.doMock('../src/services/LoggerService', () => ({
    __esModule: true,
    LoggerService: {
      warn: loggerWarn,
      error: loggerError,
    },
  }));

  jest.doMock('../src/config', () => ({
    __esModule: true,
    config: {
      googleWebClientId: 'web-client-id',
      googleIosClientId: 'ios-client-id',
    },
  }));

  if (googleModuleMode === 'throw') {
    jest.doMock('@react-native-google-signin/google-signin', () => {
      throw new Error('native module unavailable');
    });
  } else if (googleModuleMode === 'missing') {
    jest.doMock('@react-native-google-signin/google-signin', () => ({
      __esModule: true,
      GoogleSignin: null,
    }));
  } else {
    jest.doMock('@react-native-google-signin/google-signin', () => ({
      __esModule: true,
      GoogleSignin: googleSigninMock,
    }));
  }

  const { GoogleAuthService } = require('../src/services/GoogleAuthService');
  return { GoogleAuthService, googleSigninMock, loggerWarn, loggerError };
};

describe('GoogleAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('short-circuits on web platform', async () => {
    const { GoogleAuthService } = loadGoogleAuthService(true);
    const service = new GoogleAuthService(['scope-a']);

    expect(await service.signInInteractive()).toBe(false);
    expect(await service.getCurrentUserScopes()).toBeNull();
    expect(await service.getCurrentUserEmail()).toBeNull();
    expect(await service.getAccessToken()).toBeNull();
  });

  it('handles missing GoogleSignin module gracefully', async () => {
    const { GoogleAuthService, loggerWarn } = loadGoogleAuthService(
      false,
      'throw',
    );
    const service = new GoogleAuthService(['email']);

    service.configureGoogleSignIn('web-id', 'ios-id');
    expect(await service.signInInteractive()).toBe(false);
    expect(await service.getAccessToken()).toBeNull();
    expect(loggerWarn).toHaveBeenCalled();
  });

  it('configures and signs in interactively on native', async () => {
    const { GoogleAuthService, googleSigninMock } =
      loadGoogleAuthService(false);
    const service = new GoogleAuthService(['email', 'profile']);

    googleSigninMock.hasPlayServices.mockResolvedValue(true);
    googleSigninMock.signIn.mockResolvedValue({});

    service.configureGoogleSignIn('web-id', 'ios-id');
    expect(googleSigninMock.configure).toHaveBeenCalledWith({
      scopes: ['email', 'profile'],
      webClientId: 'web-id',
      iosClientId: 'ios-id',
      offlineAccess: true,
      forceCodeForRefreshToken: false,
    });

    expect(await service.signInInteractive()).toBe(true);
    expect(googleSigninMock.hasPlayServices).toHaveBeenCalledWith({
      showPlayServicesUpdateDialog: true,
    });
    expect(googleSigninMock.signIn).toHaveBeenCalledTimes(1);
  });

  it('returns filtered current user scopes and email', async () => {
    const { GoogleAuthService, googleSigninMock } =
      loadGoogleAuthService(false);
    const service = new GoogleAuthService(['email']);

    googleSigninMock.getCurrentUser.mockResolvedValue({
      scopes: ['scope:tasks', null, 7, 'scope:calendar'],
      user: { email: 'person@example.com' },
    });

    expect(await service.getCurrentUserScopes()).toEqual([
      'scope:tasks',
      'scope:calendar',
    ]);
    expect(await service.getCurrentUserEmail()).toBe('person@example.com');
  });

  it('returns null when scopes/email are not valid strings', async () => {
    const { GoogleAuthService, googleSigninMock } =
      loadGoogleAuthService(false);
    const service = new GoogleAuthService(['email']);

    googleSigninMock.getCurrentUser.mockResolvedValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      scopes: 'not-an-array' as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user: { email: 42 as any },
    });

    expect(await service.getCurrentUserScopes()).toBeNull();
    expect(await service.getCurrentUserEmail()).toBeNull();
  });

  it('logs and returns null when profile reads fail', async () => {
    const { GoogleAuthService, googleSigninMock, loggerWarn } =
      loadGoogleAuthService(false);
    const service = new GoogleAuthService(['email']);

    googleSigninMock.getCurrentUser.mockRejectedValue(
      new Error('profile unavailable'),
    );
    expect(await service.getCurrentUserScopes()).toBeNull();
    expect(await service.getCurrentUserEmail()).toBeNull();
    expect(loggerWarn).toHaveBeenCalled();
  });

  it('returns false when GoogleSignin is missing during sign-in', async () => {
    const { GoogleAuthService } = loadGoogleAuthService(false, 'missing');
    const service = new GoogleAuthService(['email']);

    expect(await service.signInInteractive()).toBe(false);
  });

  it('returns false when interactive sign-in throws', async () => {
    const { GoogleAuthService, googleSigninMock, loggerError } =
      loadGoogleAuthService(false);
    const service = new GoogleAuthService(['email']);

    googleSigninMock.hasPlayServices.mockResolvedValue(true);
    googleSigninMock.signIn.mockRejectedValue(new Error('signin failed'));

    expect(await service.signInInteractive()).toBe(false);
    expect(loggerError).toHaveBeenCalledTimes(1);
  });

  it('returns access token when silent auth succeeds', async () => {
    const { GoogleAuthService, googleSigninMock } =
      loadGoogleAuthService(false);
    const service = new GoogleAuthService(['email']);

    googleSigninMock.signInSilently.mockResolvedValue({});
    googleSigninMock.getTokens.mockResolvedValue({ accessToken: 'token-123' });

    expect(await service.getAccessToken()).toBe('token-123');
  });

  it('returns null token when silent sign-in fails', async () => {
    const { GoogleAuthService, googleSigninMock, loggerWarn } =
      loadGoogleAuthService(false);
    const service = new GoogleAuthService(['email']);

    googleSigninMock.signInSilently.mockRejectedValue(
      new Error('silent auth failed'),
    );

    expect(await service.getAccessToken()).toBeNull();
    expect(googleSigninMock.signInSilently).toHaveBeenCalledTimes(1);
    expect(loggerWarn).toHaveBeenCalledTimes(1);
  });
});

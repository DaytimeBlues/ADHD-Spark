import type { GoogleAuthData } from '../src/services/OAuthService';

const fetchMock = jest.fn();

type StorageRecord = Record<string, string>;

const createLocalStorageMock = () => {
  let store: StorageRecord = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
};

const createAsyncStorageMock = () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
});

const createGoogleSigninMock = () => ({
  hasPlayServices: jest.fn(),
  signIn: jest.fn(),
  getTokens: jest.fn(),
});

interface LoadOptions {
  isWeb?: boolean;
  popupEnabled?: boolean;
}

const loadOAuthService = (options: LoadOptions = {}) => {
  const { isWeb = true, popupEnabled = true } = options;
  jest.resetModules();

  const localStorageMock = createLocalStorageMock();
  const asyncStorageMock = createAsyncStorageMock();
  const googleSigninMock = createGoogleSigninMock();
  const loggerError = jest.fn();
  const listeners: Array<(event: MessageEvent) => void> = [];

  const popup = {
    closed: false,
    close: jest.fn(() => {
      popup.closed = true;
    }),
  };

  const windowMock = {
    location: { origin: 'https://app.example' },
    screenX: 0,
    screenY: 0,
    outerWidth: 1200,
    outerHeight: 800,
    open: jest.fn(() => (popupEnabled ? popup : null)),
    addEventListener: jest.fn(
      (event: string, handler: (event: MessageEvent) => void) => {
        if (event === 'message') {
          listeners.push(handler);
        }
      },
    ),
    removeEventListener: jest.fn(
      (event: string, handler: (event: MessageEvent) => void) => {
        if (event !== 'message') {
          return;
        }
        const index = listeners.indexOf(handler);
        if (index >= 0) {
          listeners.splice(index, 1);
        }
      },
    ),
  };

  const dispatchMessage = (payload: {
    origin?: string;
    data: Record<string, unknown>;
  }) => {
    const event = {
      origin: payload.origin ?? windowMock.location.origin,
      data: payload.data,
    } as MessageEvent;
    listeners.slice().forEach((handler) => handler(event));
  };

  jest.doMock('../src/utils/PlatformUtils', () => ({
    __esModule: true,
    isWeb,
  }));

  jest.doMock('../src/services/LoggerService', () => ({
    __esModule: true,
    LoggerService: {
      error: loggerError,
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      fatal: jest.fn(),
    },
  }));

  jest.doMock('@react-native-async-storage/async-storage', () => ({
    __esModule: true,
    default: asyncStorageMock,
  }));

  jest.doMock('@react-native-google-signin/google-signin', () => ({
    __esModule: true,
    GoogleSignin: googleSigninMock,
    default: { GoogleSignin: googleSigninMock },
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).fetch = fetchMock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).window = windowMock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).localStorage = localStorageMock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).btoa = (input: string) =>
    Buffer.from(input, 'binary').toString('base64');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).crypto = require('crypto').webcrypto;

  const { OAuthService } = require('../src/services/OAuthService');
  return {
    OAuthService,
    localStorageMock,
    asyncStorageMock,
    googleSigninMock,
    windowMock,
    popup,
    dispatchMessage,
    loggerError,
  };
};

describe('OAuthService (shared implementation)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns initiation error when Google bootstrap fetch fails', async () => {
    const { OAuthService, loggerError } = loadOAuthService();
    fetchMock.mockRejectedValueOnce(new Error('network down'));

    const result = await OAuthService.initiateGoogleAuth();
    expect(result).toEqual({
      success: false,
      error: 'Failed to initiate authentication',
    });
    expect(loggerError).toHaveBeenCalledTimes(1);
  });

  it('returns popup blocked when Todoist popup cannot open', async () => {
    const { OAuthService } = loadOAuthService({ popupEnabled: false });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        authUrl: 'https://todoist.example/auth',
        state: 'todo-state',
      }),
    });

    const result = await OAuthService.initiateTodoistAuth();
    expect(result).toEqual({
      success: false,
      error: 'Popup blocked. Please allow popups for this site.',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/todoist-oauth-init'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('returns popup blocked after successful Google bootstrap init', async () => {
    const { OAuthService } = loadOAuthService({ popupEnabled: false });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        authUrl: 'https://google.example/auth',
        state: 'google-state',
      }),
    });

    const result = await OAuthService.initiateGoogleAuth();
    expect(result).toEqual({
      success: false,
      error: 'Popup blocked. Please allow popups for this site.',
    });
  });

  it('routes initiateGoogleAuth to the native handler when not on web', async () => {
    const { OAuthService } = loadOAuthService({ isWeb: false });

    const nativeSpy = jest.spyOn(
      OAuthService as any,
      'initiateGoogleAuthNative',
    );
    nativeSpy.mockResolvedValue({ success: true });

    await expect(OAuthService.initiateGoogleAuth()).resolves.toEqual({
      success: true,
    });
    expect(nativeSpy).toHaveBeenCalledTimes(1);
  });

  it('returns native auth failure when Google sign-in throws', async () => {
    const { OAuthService } = loadOAuthService({ isWeb: false });
    await expect(OAuthService.initiateGoogleAuth()).resolves.toEqual({
      success: false,
      error: 'Google sign-in failed',
    });
  });

  it('handles popup callback error and invalid state branches', async () => {
    jest.useFakeTimers();
    const withError = loadOAuthService();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorPromise = (withError.OAuthService as any).openOAuthPopup(
      'https://auth.example',
      'state-1',
      'google',
    );
    withError.dispatchMessage({
      data: {
        type: 'oauth-callback',
        code: 'auth-code',
        receivedState: 'state-1',
        error: 'access_denied',
      },
    });
    await expect(errorPromise).resolves.toEqual({
      success: false,
      error: 'access_denied',
    });
    jest.runOnlyPendingTimers();

    const withInvalidState = loadOAuthService();

    const mismatchPromise = (
      withInvalidState.OAuthService as any
    ).openOAuthPopup('https://auth.example', 'state-2', 'google');
    withInvalidState.dispatchMessage({
      origin: 'https://evil.example',
      data: {
        type: 'oauth-callback',
        code: 'ignored',
        receivedState: 'state-2',
      },
    });
    withInvalidState.dispatchMessage({
      data: {
        type: 'oauth-callback',
        code: 'auth-code',
        receivedState: 'wrong-state',
      },
    });
    await expect(mismatchPromise).resolves.toEqual({
      success: false,
      error: 'Invalid state parameter',
    });
    jest.runOnlyPendingTimers();
  });

  it('times out popup auth after five minutes', async () => {
    jest.useFakeTimers();
    const { OAuthService } = loadOAuthService();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const popupPromise = (OAuthService as any).openOAuthPopup(
      'https://auth.example',
      'state-1',
      'google',
    );

    jest.advanceTimersByTime(5 * 60 * 1000);
    await expect(popupPromise).resolves.toEqual({
      success: false,
      error: 'Authentication timed out',
    });
  });

  it('exchanges Google code using PKCE verifier and persists auth', async () => {
    const { OAuthService, localStorageMock } = loadOAuthService();
    localStorageMock.setItem(
      'oauthState',
      JSON.stringify({
        provider: 'google',
        state: 'state-1',
        redirectUri: 'https://app.example/ADHD-CADDI/',
        timestamp: Date.now(),
      }),
    );
    localStorageMock.setItem('codeVerifier', 'verifier-123');
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: 'google-token',
        expiresIn: 1800,
        email: 'google@example.com',
        name: 'Google User',
        picture: 'avatar.png',
      }),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (OAuthService as any).exchangeCodeForTokens(
      'auth-code',
      'google',
      'state-1',
    );
    expect(result).toEqual({ success: true });

    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(requestBody).toMatchObject({
      code: 'auth-code',
      state: 'state-1',
      expectedState: 'state-1',
      codeVerifier: 'verifier-123',
    });

    const stored = JSON.parse(
      localStorageMock.getItem('googleAuth') as string,
    ) as GoogleAuthData;
    expect(stored.accessToken).toBe('google-token');
    expect(localStorageMock.getItem('oauthState')).toBeNull();
    expect(localStorageMock.getItem('codeVerifier')).toBeNull();
  });

  it('handles token exchange guard rails and fallback errors', async () => {
    const { OAuthService, localStorageMock, loggerError } = loadOAuthService();

    await expect(
      (OAuthService as any).exchangeCodeForTokens('x', 'google', 's'),
    ).resolves.toEqual({ success: false, error: 'OAuth state not found' });

    localStorageMock.setItem(
      'oauthState',
      JSON.stringify({
        provider: 'google',
        state: 'state-2',
        redirectUri: 'https://app.example/ADHD-CADDI/',
        timestamp: Date.now() - 11 * 60 * 1000,
      }),
    );

    await expect(
      (OAuthService as any).exchangeCodeForTokens('x', 'google', 's'),
    ).resolves.toEqual({ success: false, error: 'Authentication expired' });

    localStorageMock.setItem(
      'oauthState',
      JSON.stringify({
        provider: 'google',
        state: 'state-3',
        redirectUri: 'https://app.example/ADHD-CADDI/',
        timestamp: Date.now(),
      }),
    );
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'invalid_grant' }),
    });

    await expect(
      (OAuthService as any).exchangeCodeForTokens('x', 'google', 's'),
    ).resolves.toEqual({ success: false, error: 'invalid_grant' });

    localStorageMock.setItem(
      'oauthState',
      JSON.stringify({
        provider: 'google',
        state: 'state-4',
        redirectUri: 'https://app.example/ADHD-CADDI/',
        timestamp: Date.now(),
      }),
    );
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    await expect(
      (OAuthService as any).exchangeCodeForTokens('x', 'google', 's'),
    ).resolves.toEqual({ success: false, error: 'Token exchange failed' });

    localStorageMock.setItem(
      'oauthState',
      JSON.stringify({
        provider: 'google',
        state: 'state-5',
        redirectUri: 'https://app.example/ADHD-CADDI/',
        timestamp: Date.now(),
      }),
    );
    fetchMock.mockRejectedValueOnce(new Error('exchange crashed'));

    await expect(
      (OAuthService as any).exchangeCodeForTokens('x', 'google', 's'),
    ).resolves.toEqual({
      success: false,
      error: 'Failed to complete authentication',
    });
    expect(loggerError).toHaveBeenCalled();
  });

  it('persists Todoist token exchange and supports auth read/disconnect', async () => {
    const { OAuthService, localStorageMock } = loadOAuthService();
    localStorageMock.setItem(
      'oauthState',
      JSON.stringify({
        provider: 'todoist',
        state: 'todo-state',
        redirectUri: 'https://app.example/ADHD-CADDI/',
        timestamp: Date.now(),
      }),
    );
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: 'todo-token',
        email: 'todo@example.com',
        name: 'Todo User',
      }),
    });

    await expect(
      (OAuthService as any).exchangeCodeForTokens('x', 'todoist', 's'),
    ).resolves.toEqual({ success: true });
    expect(localStorageMock.getItem('todoistAuth')).toContain('todo-token');

    await expect(OAuthService.getTodoistAuth()).resolves.toEqual(
      expect.objectContaining({ connected: true }),
    );
    await OAuthService.disconnectTodoist();
    await expect(OAuthService.getTodoistAuth()).resolves.toBeNull();
  });

  it('handles refresh/token validity guard rails', async () => {
    const { OAuthService, localStorageMock, loggerError } = loadOAuthService();

    expect(await OAuthService.refreshGoogleToken()).toBe(false);

    localStorageMock.setItem(
      'googleAuth',
      JSON.stringify({
        connected: true,
        accessToken: 'old-token',
        refreshToken: 'legacy-refresh',
        expiresAt: Date.now() + 30000,
      }),
    );
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ accessToken: 'new-token', expiresIn: 1800 }),
    });
    expect(await OAuthService.refreshGoogleToken()).toBe(true);

    const refreshed = JSON.parse(
      localStorageMock.getItem('googleAuth') as string,
    ) as GoogleAuthData;
    expect(refreshed.accessToken).toBe('new-token');
    expect(refreshed.refreshToken).toBeUndefined();

    localStorageMock.setItem(
      'googleAuth',
      JSON.stringify({
        connected: true,
        accessToken: 'new-token',
        expiresAt: Date.now() + 6 * 60 * 1000,
      }),
    );
    expect(await OAuthService.isGoogleTokenValid()).toBe(true);

    localStorageMock.setItem(
      'googleAuth',
      JSON.stringify({
        connected: true,
        accessToken: 'new-token',
        expiresAt: Date.now() + 60 * 1000,
      }),
    );
    expect(await OAuthService.isGoogleTokenValid()).toBe(false);

    localStorageMock.setItem(
      'googleAuth',
      JSON.stringify({
        connected: true,
        accessToken: 'new-token',
        refreshToken: 'legacy-refresh',
      }),
    );
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'invalid_grant' }),
    });
    expect(await OAuthService.refreshGoogleToken()).toBe(false);
    expect(localStorageMock.getItem('googleAuth')).toBeNull();

    localStorageMock.setItem(
      'googleAuth',
      JSON.stringify({
        connected: true,
        accessToken: 'new-token',
        refreshToken: 'legacy-refresh',
      }),
    );
    fetchMock.mockRejectedValueOnce(new Error('refresh unavailable'));
    expect(await OAuthService.refreshGoogleToken()).toBe(false);
    expect(loggerError).toHaveBeenCalled();
  });
});

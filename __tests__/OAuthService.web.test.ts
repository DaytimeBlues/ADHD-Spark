import type { GoogleAuthData } from '../src/services/OAuthService.web';

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

const loadWebOAuthService = (popupEnabled = true) => {
  jest.resetModules();

  const localStorageMock = createLocalStorageMock();
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

  const { OAuthService } = require('../src/services/OAuthService.web');
  return {
    OAuthService,
    localStorageMock,
    windowMock,
    dispatchMessage,
    loggerError,
  };
};

describe('OAuthService.web', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns initiation error when Google bootstrap fetch fails', async () => {
    const { OAuthService, loggerError } = loadWebOAuthService();
    fetchMock.mockRejectedValueOnce(new Error('network down'));

    const result = await OAuthService.initiateGoogleAuth();
    expect(result).toEqual({
      success: false,
      error: 'Failed to initiate authentication',
    });
    expect(loggerError).toHaveBeenCalledTimes(1);
  });

  it('returns popup blocked if Google popup cannot open', async () => {
    const { OAuthService } = loadWebOAuthService(false);
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

  it('returns initiation error when Todoist bootstrap fails', async () => {
    const { OAuthService, loggerError } = loadWebOAuthService();
    fetchMock.mockResolvedValueOnce({ ok: false });

    const result = await OAuthService.initiateTodoistAuth();
    expect(result).toEqual({
      success: false,
      error: 'Failed to initiate authentication',
    });
    expect(loggerError).toHaveBeenCalledTimes(1);
  });

  it('returns popup blocked after successful Todoist bootstrap init', async () => {
    const { OAuthService } = loadWebOAuthService(false);
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
  });

  it('handles popup callback error and invalid state branches', async () => {
    jest.useFakeTimers();
    const withError = loadWebOAuthService();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorPromise = (withError.OAuthService as any).openOAuthPopup(
      'https://auth.example',
      'state-1',
      'google',
    );
    withError.dispatchMessage({
      data: {
        type: 'oauth-callback',
        code: 'x',
        receivedState: 'state-1',
        error: 'denied',
      },
    });
    await expect(errorPromise).resolves.toEqual({
      success: false,
      error: 'denied',
    });
    jest.runOnlyPendingTimers();

    const withInvalidState = loadWebOAuthService();

    const mismatchPromise = (
      withInvalidState.OAuthService as any
    ).openOAuthPopup('https://auth.example', 'state-2', 'todoist');
    withInvalidState.dispatchMessage({
      origin: 'https://evil.example',
      data: {
        type: 'oauth-callback',
        code: 'ignored',
        receivedState: 'state-2',
      },
    });
    withInvalidState.dispatchMessage({
      data: { type: 'oauth-callback', code: 'x', receivedState: 'wrong-state' },
    });
    await expect(mismatchPromise).resolves.toEqual({
      success: false,
      error: 'Invalid state parameter',
    });
    jest.runOnlyPendingTimers();
  });

  it('times out popup auth after five minutes', async () => {
    jest.useFakeTimers();
    const { OAuthService } = loadWebOAuthService();
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

  it('exchanges Google code with PKCE verifier and stores safe auth payload', async () => {
    const { OAuthService, localStorageMock } = loadWebOAuthService();
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
        accessToken: 'new-token',
        expiresIn: 1800,
        email: 'user@example.com',
        name: 'User',
        picture: 'avatar.png',
      }),
    });

    await expect(
      (OAuthService as any).exchangeCodeForTokens('code', 'google', 's'),
    ).resolves.toEqual({ success: true });

    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(requestBody.codeVerifier).toBe('verifier-123');

    const stored = JSON.parse(
      localStorageMock.getItem('googleAuth') as string,
    ) as GoogleAuthData;
    expect(stored.accessToken).toBe('new-token');
    expect(localStorageMock.getItem('codeVerifier')).toBeNull();
  });

  it('handles token exchange guard rails and fallback errors', async () => {
    const { OAuthService, localStorageMock, loggerError } =
      loadWebOAuthService();

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
    fetchMock.mockRejectedValueOnce(new Error('exchange failed'));

    await expect(
      (OAuthService as any).exchangeCodeForTokens('x', 'google', 's'),
    ).resolves.toEqual({
      success: false,
      error: 'Failed to complete authentication',
    });
    expect(loggerError).toHaveBeenCalled();
  });

  it('handles refresh validity, refresh failure, and disconnect helpers', async () => {
    const { OAuthService, localStorageMock, loggerError } =
      loadWebOAuthService();

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
    expect(refreshed.refreshToken).toBeUndefined();

    localStorageMock.setItem(
      'googleAuth',
      JSON.stringify({
        connected: true,
        accessToken: 'token',
        expiresAt: Date.now() + 6 * 60 * 1000,
      }),
    );
    expect(await OAuthService.isGoogleTokenValid()).toBe(true);

    localStorageMock.setItem(
      'googleAuth',
      JSON.stringify({
        connected: true,
        accessToken: 'token',
        expiresAt: Date.now() + 60 * 1000,
      }),
    );
    expect(await OAuthService.isGoogleTokenValid()).toBe(false);

    localStorageMock.setItem(
      'googleAuth',
      JSON.stringify({
        connected: true,
        accessToken: 'old-token',
      }),
    );
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'invalid_grant' }),
    });
    expect(await OAuthService.refreshGoogleToken()).toBe(false);
    expect(localStorageMock.getItem('googleAuth')).toBeNull();

    localStorageMock.setItem(
      'todoistAuth',
      JSON.stringify({ connected: true, accessToken: 'todo-token' }),
    );
    await expect(OAuthService.getTodoistAuth()).resolves.toEqual(
      expect.objectContaining({ connected: true }),
    );
    await OAuthService.disconnectTodoist();
    await expect(OAuthService.getTodoistAuth()).resolves.toBeNull();

    localStorageMock.setItem(
      'googleAuth',
      JSON.stringify({
        connected: true,
        accessToken: 'old-token',
      }),
    );
    fetchMock.mockRejectedValueOnce(new Error('refresh crashed'));
    expect(await OAuthService.refreshGoogleToken()).toBe(false);
    expect(loggerError).toHaveBeenCalled();
  });
});

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
    dump: () => ({ ...store }),
  };
};

const loadWebOAuthService = () => {
  jest.resetModules();

  const localStorageMock = createLocalStorageMock();
  const popup = {
    closed: false,
    close: jest.fn(),
  };

  const windowMock = {
    location: { origin: 'https://app.example' },
    screenX: 0,
    screenY: 0,
    outerWidth: 1200,
    outerHeight: 800,
    open: jest.fn(() => popup),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };

  jest.doMock('../src/services/LoggerService', () => ({
    __esModule: true,
    LoggerService: {
      error: jest.fn(),
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
  return { OAuthService, windowMock, localStorageMock, popup };
};

describe('OAuthService.web', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.mockReset();
  });

  it('returns initiation error when google oauth bootstrap fails', async () => {
    const { OAuthService } = loadWebOAuthService();
    fetchMock.mockRejectedValueOnce(new Error('network down'));

    const result = await OAuthService.initiateGoogleAuth();
    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to initiate authentication');
  });

  it('exchanges Todoist code and persists tokens', async () => {
    const { OAuthService, localStorageMock } = loadWebOAuthService();

    localStorageMock.setItem(
      'oauthState',
      JSON.stringify({
        provider: 'todoist',
        state: 'state-1',
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

    const result = await (OAuthService as any).exchangeCodeForTokens(
      'auth-code',
      'todoist',
      'state-1',
    );
    expect(result).toEqual({ success: true });
    expect(localStorageMock.getItem('todoistAuth')).toContain('todo-token');
    expect(localStorageMock.getItem('oauthState')).toBeNull();
  });

  it('refreshes token using cookie session and stores safe auth payload', async () => {
    const { OAuthService, localStorageMock } = loadWebOAuthService();
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

    const refreshed = await OAuthService.refreshGoogleToken();
    expect(refreshed).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/google-refresh'),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    );

    const stored = JSON.parse(
      localStorageMock.getItem('googleAuth') as string,
    ) as GoogleAuthData;
    expect(stored.accessToken).toBe('new-token');
    expect(stored.refreshToken).toBeUndefined();
  });

  it('clears local auth when refresh call fails', async () => {
    const { OAuthService, localStorageMock } = loadWebOAuthService();
    localStorageMock.setItem(
      'googleAuth',
      JSON.stringify({ connected: true, accessToken: 'old-token' }),
    );

    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'invalid_grant' }),
    });

    const refreshed = await OAuthService.refreshGoogleToken();
    expect(refreshed).toBe(false);
    expect(localStorageMock.getItem('googleAuth')).toBeNull();
  });

  it('validates expiry with five-minute clock skew window', async () => {
    const { OAuthService, localStorageMock } = loadWebOAuthService();
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
  });
});

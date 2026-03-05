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
    dump: () => ({ ...store }),
  };
};

const loadOAuthService = () => {
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

  jest.doMock('../src/utils/PlatformUtils', () => ({
    __esModule: true,
    isWeb: true,
  }));

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

  const { OAuthService } = require('../src/services/OAuthService');
  return { OAuthService, localStorageMock };
};

describe('OAuthService (shared implementation)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.mockReset();
  });

  it('returns an initiation error when OAuth bootstrap fails', async () => {
    const { OAuthService } = loadOAuthService();
    fetchMock.mockRejectedValueOnce(new Error('network down'));

    const result = await OAuthService.initiateGoogleAuth();
    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to initiate authentication');
  });

  it('exchanges Todoist code and stores auth payload', async () => {
    const { OAuthService, localStorageMock } = loadOAuthService();

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

  it('refreshes Google token and persists payload without refresh token', async () => {
    const { OAuthService, localStorageMock } = loadOAuthService();
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

  it('clears auth on refresh failure and validates token expiry', async () => {
    const { OAuthService, localStorageMock } = loadOAuthService();

    localStorageMock.setItem(
      'googleAuth',
      JSON.stringify({ connected: true, accessToken: 'old-token' }),
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

import { OAuthWebAdapter } from '../src/services/oauth/OAuthWebAdapter';
import { STORAGE_KEYS } from '../src/services/oauth/OAuthShared';

describe('OAuthWebAdapter', () => {
  const storage = {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => undefined),
    removeItem: jest.fn(async () => undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores only non-sensitive google connection metadata on web', async () => {
    const adapter = new OAuthWebAdapter(storage);

    await (
      adapter as unknown as {
        storeAuthData: (
          provider: 'google',
          data: Record<string, unknown>,
        ) => Promise<void>;
      }
    ).storeAuthData('google', {
      accessToken: 'secret-google-token',
      expiresIn: 1800,
      email: 'dev@example.com',
      name: 'Dev User',
      picture: 'https://example.com/avatar.png',
    });

    expect(storage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.googleAuth,
      expect.any(String),
    );

    const stored = JSON.parse(storage.setItem.mock.calls[0][1] as string);
    expect(stored).toMatchObject({
      connected: true,
      email: 'dev@example.com',
      name: 'Dev User',
      picture: 'https://example.com/avatar.png',
    });
    expect(stored.expiresAt).toEqual(expect.any(Number));
    expect(stored.accessToken).toBeUndefined();
    expect(stored.refreshToken).toBeUndefined();
  });

  it('stores only non-sensitive todoist connection metadata on web', async () => {
    const adapter = new OAuthWebAdapter(storage);

    await (
      adapter as unknown as {
        storeAuthData: (
          provider: 'todoist',
          data: Record<string, unknown>,
        ) => Promise<void>;
      }
    ).storeAuthData('todoist', {
      accessToken: 'secret-todoist-token',
      email: 'dev@example.com',
      name: 'Todoist Dev',
    });

    const stored = JSON.parse(storage.setItem.mock.calls[0][1] as string);
    expect(stored).toEqual({
      connected: true,
      email: 'dev@example.com',
      name: 'Todoist Dev',
    });
    expect(stored.accessToken).toBeUndefined();
  });

  it('fails closed for web OAuth connect until session-backed sync exists', async () => {
    const adapter = new OAuthWebAdapter(storage);

    await expect(adapter.initiateGoogleAuth()).resolves.toEqual({
      success: false,
      error:
        'Google connect on web is disabled until session-backed web sync is available.',
    });
    await expect(adapter.initiateTodoistAuth()).resolves.toEqual({
      success: false,
      error:
        'Todoist connect on web is disabled until session-backed web sync is available.',
    });
    expect(storage.setItem).not.toHaveBeenCalled();
  });
});

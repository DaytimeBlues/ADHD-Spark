import { createConfig } from '../src/config';

describe('runtime config', () => {
  it('reports invalid API URLs as startup errors and falls back safely', () => {
    const config = createConfig({
      EXPO_PUBLIC_API_BASE_URL: 'not-a-url',
      EXPO_PUBLIC_ENV: 'production',
    });

    expect(config.apiBaseUrl).toBe('https://spark-adhd-api.vercel.app');
    expect(config.startupErrors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'INVALID_API_BASE_URL' }),
      ]),
    );
  });

  it('warns when Google client IDs are missing', () => {
    const config = createConfig({
      EXPO_PUBLIC_ENV: 'development',
    });

    expect(config.startupWarnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'MISSING_GOOGLE_CLIENT_IDS' }),
      ]),
    );
  });

  it('falls back to vercel when direct AI is requested without a key', () => {
    const config = createConfig({
      EXPO_PUBLIC_ENV: 'development',
      EXPO_PUBLIC_AI_PROVIDER: 'kimi-direct',
    });

    expect(config.aiProvider).toBe('vercel');
    expect(config.startupWarnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'DIRECT_AI_KEY_MISSING' }),
      ]),
    );
  });
});

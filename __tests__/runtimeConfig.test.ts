import { createConfig } from '../src/config/runtimeConfig';

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

  it('blocks direct AI in production even when insecure override is set', () => {
    const config = createConfig({
      EXPO_PUBLIC_ENV: 'production',
      EXPO_PUBLIC_AI_PROVIDER: 'kimi-direct',
      EXPO_PUBLIC_ENABLE_INSECURE_DIRECT_AI: 'true',
      EXPO_PUBLIC_MOONSHOT_API_KEY: 'public-key',
    });

    expect(config.aiProvider).toBe('vercel');
    expect(config.moonshotApiKey).toBeUndefined();
    expect(config.startupWarnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'UNSAFE_DIRECT_AI_ENABLED' }),
        expect.objectContaining({ code: 'PUBLIC_DIRECT_AI_KEY' }),
      ]),
    );
  });

  it('never activates gemini direct in production even when a public key is present', () => {
    const config = createConfig({
      EXPO_PUBLIC_ENV: 'production',
      EXPO_PUBLIC_AI_PROVIDER: 'gemini-direct',
      EXPO_PUBLIC_GEMINI_API_KEY: 'public-gemini-key',
    });

    expect(config.aiProvider).toBe('vercel');
    expect(config.geminiApiKey).toBeUndefined();
    expect(config.startupWarnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'PUBLIC_DIRECT_AI_KEY' }),
        expect.objectContaining({ code: 'UNSAFE_DIRECT_AI_ENABLED' }),
      ]),
    );
  });

  it('falls back safely when AI timeout and retry values are out of range', () => {
    const config = createConfig({
      EXPO_PUBLIC_ENV: 'development',
      EXPO_PUBLIC_AI_TIMEOUT: '999999',
      EXPO_PUBLIC_AI_MAX_RETRIES: '-4',
    });

    expect(config.aiTimeout).toBe(8000);
    expect(config.aiMaxRetries).toBe(3);
    expect(config.startupWarnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'INVALID_AI_TIMEOUT' }),
        expect.objectContaining({ code: 'INVALID_AI_MAX_RETRIES' }),
      ]),
    );
  });
});

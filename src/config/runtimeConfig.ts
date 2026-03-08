export type AiProvider = 'vercel' | 'gemini-direct' | 'kimi-direct';

export interface StartupDiagnostic {
  severity: 'error' | 'warning';
  code:
    | 'INVALID_API_BASE_URL'
    | 'MISSING_GOOGLE_CLIENT_IDS'
    | 'PUBLIC_DIRECT_AI_KEY'
    | 'DIRECT_AI_KEY_MISSING'
    | 'UNSAFE_DIRECT_AI_ENABLED'
    | 'SENTRY_DSN_MISSING';
  message: string;
  envVar?: string;
  feature?: string;
}

export interface Config {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
  googleWebClientId?: string;
  googleIosClientId?: string;
  aiProvider: AiProvider;
  geminiApiKey?: string;
  moonshotApiKey?: string;
  kimiModel: string;
  aiTimeout: number;
  aiMaxRetries: number;
  sentryDsn?: string;
  startupErrors: StartupDiagnostic[];
  startupWarnings: StartupDiagnostic[];
}

type RuntimeEnv = Record<string, string | undefined>;

const DEFAULT_API_BASE_URL = 'https://spark-adhd-api.vercel.app';

const getRuntimeEnv = (): RuntimeEnv => {
  if (typeof process === 'undefined' || !process.env) {
    return {};
  }

  return process.env;
};

const getEnvironment = (env: RuntimeEnv): Config['environment'] => {
  if (env.NODE_ENV === 'development' || env.EXPO_PUBLIC_ENV === 'development') {
    return 'development';
  }

  if (env.EXPO_PUBLIC_ENV === 'staging') {
    return 'staging';
  }

  return 'production';
};

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const isValidUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const createConfig = (env: RuntimeEnv = getRuntimeEnv()): Config => {
  const environment = getEnvironment(env);
  const startupErrors: StartupDiagnostic[] = [];
  const startupWarnings: StartupDiagnostic[] = [];
  const allowInsecureDirectAi =
    env.EXPO_PUBLIC_ENABLE_INSECURE_DIRECT_AI === 'true';
  const canUseDirectClientAi =
    environment !== 'production' || allowInsecureDirectAi;

  let apiBaseUrl = env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;
  if (!isValidUrl(apiBaseUrl)) {
    startupErrors.push({
      severity: 'error',
      code: 'INVALID_API_BASE_URL',
      envVar: 'EXPO_PUBLIC_API_BASE_URL',
      feature: 'api',
      message:
        'EXPO_PUBLIC_API_BASE_URL must be a valid http or https URL. Falling back to the default API endpoint.',
    });
    apiBaseUrl = DEFAULT_API_BASE_URL;
  }

  const config: Config = {
    apiBaseUrl,
    environment,
    googleWebClientId: env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    googleIosClientId: env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    aiProvider: 'vercel',
    geminiApiKey: undefined,
    moonshotApiKey: undefined,
    kimiModel: env.EXPO_PUBLIC_KIMI_MODEL || 'kimi-k2.5',
    aiTimeout: parsePositiveInteger(env.EXPO_PUBLIC_AI_TIMEOUT, 8000),
    aiMaxRetries: parsePositiveInteger(env.EXPO_PUBLIC_AI_MAX_RETRIES, 3),
    sentryDsn: env.EXPO_PUBLIC_SENTRY_DSN,
    startupErrors,
    startupWarnings,
  };

  if (!config.googleWebClientId && !config.googleIosClientId) {
    startupWarnings.push({
      severity: 'warning',
      code: 'MISSING_GOOGLE_CLIENT_IDS',
      envVar: 'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
      feature: 'google-sync',
      message:
        'Google client IDs are not configured. Google sign-in, Tasks, and Calendar sync will stay disabled until they are set.',
    });
  }

  if (environment === 'production' && !config.sentryDsn) {
    startupWarnings.push({
      severity: 'warning',
      code: 'SENTRY_DSN_MISSING',
      envVar: 'EXPO_PUBLIC_SENTRY_DSN',
      feature: 'observability',
      message:
        'EXPO_PUBLIC_SENTRY_DSN is not configured. Production crashes will only appear in local console output.',
    });
  }

  const registerDirectProvider = (
    provider: Extract<AiProvider, 'gemini-direct' | 'kimi-direct'>,
    keyValue: string | undefined,
    keyName: string,
  ) => {
    if (!keyValue) {
      startupWarnings.push({
        severity: 'warning',
        code: 'DIRECT_AI_KEY_MISSING',
        envVar: keyName,
        feature: provider,
        message: `${provider} was requested but ${keyName} is missing. Falling back to the Vercel backend.`,
      });
      return;
    }

    startupWarnings.push({
      severity: 'warning',
      code: 'PUBLIC_DIRECT_AI_KEY',
      envVar: keyName,
      feature: provider,
      message: `${keyName} is public in a client bundle. Use the Vercel backend for real production secrets.`,
    });

    if (!canUseDirectClientAi) {
      startupWarnings.push({
        severity: 'warning',
        code: 'UNSAFE_DIRECT_AI_ENABLED',
        envVar: 'EXPO_PUBLIC_ENABLE_INSECURE_DIRECT_AI',
        feature: provider,
        message:
          'Direct client-side AI providers are blocked in production unless EXPO_PUBLIC_ENABLE_INSECURE_DIRECT_AI=true is set intentionally.',
      });
      return;
    }

    if (provider === 'gemini-direct') {
      config.geminiApiKey = keyValue;
    } else {
      config.moonshotApiKey = keyValue;
    }
    config.aiProvider = provider;
  };

  const requestedProvider = env.EXPO_PUBLIC_AI_PROVIDER;
  if (requestedProvider === 'gemini-direct') {
    registerDirectProvider(
      'gemini-direct',
      env.EXPO_PUBLIC_GEMINI_API_KEY,
      'EXPO_PUBLIC_GEMINI_API_KEY',
    );
  } else if (requestedProvider === 'kimi-direct') {
    registerDirectProvider(
      'kimi-direct',
      env.EXPO_PUBLIC_MOONSHOT_API_KEY,
      'EXPO_PUBLIC_MOONSHOT_API_KEY',
    );
  }

  if (
    config.aiProvider === 'vercel' &&
    env.EXPO_PUBLIC_GEMINI_API_KEY &&
    requestedProvider !== 'gemini-direct'
  ) {
    startupWarnings.push({
      severity: 'warning',
      code: 'PUBLIC_DIRECT_AI_KEY',
      envVar: 'EXPO_PUBLIC_GEMINI_API_KEY',
      feature: 'gemini-direct',
      message:
        'A public Gemini key is present, but the app is using the Vercel backend. Remove the public key if it is not needed.',
    });
  }

  if (
    config.aiProvider === 'vercel' &&
    env.EXPO_PUBLIC_MOONSHOT_API_KEY &&
    requestedProvider !== 'kimi-direct'
  ) {
    startupWarnings.push({
      severity: 'warning',
      code: 'PUBLIC_DIRECT_AI_KEY',
      envVar: 'EXPO_PUBLIC_MOONSHOT_API_KEY',
      feature: 'kimi-direct',
      message:
        'A public Moonshot key is present, but the app is using the Vercel backend. Remove the public key if it is not needed.',
    });
  }

  return config;
};

export const config = createConfig();

export const DEFAULTS = {
  apiBaseUrl: DEFAULT_API_BASE_URL,
};

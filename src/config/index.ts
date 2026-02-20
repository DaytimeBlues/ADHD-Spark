/**
 * Application Configuration
 *
 * Environment-based configuration for API endpoints, feature flags,
 * and AI provider settings.
 */

export type AiProvider = 'vercel' | 'gemini-direct' | 'kimi-direct';

export interface Config {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
  googleWebClientId?: string;
  googleIosClientId?: string;
  /** AI provider: 'vercel' uses the Vercel backend; 'gemini-direct' calls Gemini API from client */
  aiProvider: AiProvider;
  /** Gemini API key — only used when aiProvider === 'gemini-direct' */
  geminiApiKey?: string;
  /** Moonshot (Kimi) API key — only used when aiProvider === 'kimi-direct' */
  moonshotApiKey?: string;
  /** Kimi model name (default: kimi-k2.5) */
  kimiModel: string;
  /** AI request timeout in milliseconds (default 8000) */
  aiTimeout: number;
  /** Maximum AI request retry attempts (default 3) */
  aiMaxRetries: number;
}

const getConfig = (): Config => {
  const config: Config = {
    apiBaseUrl: 'https://spark-adhd-api.vercel.app',
    environment: 'production',
    googleWebClientId: undefined,
    googleIosClientId: undefined,
    aiProvider: 'vercel',
    geminiApiKey: undefined,
    moonshotApiKey: undefined,
    kimiModel: 'kimi-k2.5',
    aiTimeout: 8000,
    aiMaxRetries: 3,
  };

  if (typeof process !== 'undefined' && process.env) {
    if (process.env.REACT_APP_API_BASE_URL) {
      config.apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    }

    if (process.env.REACT_APP_GOOGLE_WEB_CLIENT_ID) {
      config.googleWebClientId = process.env.REACT_APP_GOOGLE_WEB_CLIENT_ID;
    }

    if (process.env.REACT_APP_GOOGLE_IOS_CLIENT_ID) {
      config.googleIosClientId = process.env.REACT_APP_GOOGLE_IOS_CLIENT_ID;
    }

    if (process.env.REACT_APP_GEMINI_API_KEY) {
      config.geminiApiKey = process.env.REACT_APP_GEMINI_API_KEY;
      // If a Gemini key is explicitly provided, default to direct mode
      config.aiProvider = 'gemini-direct';
    }

    if (process.env.REACT_APP_MOONSHOT_API_KEY) {
      config.moonshotApiKey = process.env.REACT_APP_MOONSHOT_API_KEY;
      // Default to kimi-direct if key provided but no provider set
      if (!process.env.REACT_APP_AI_PROVIDER) {
        config.aiProvider = 'kimi-direct';
      }
    }

    if (process.env.REACT_APP_KIMI_MODEL) {
      config.kimiModel = process.env.REACT_APP_KIMI_MODEL;
    }

    // Allow explicit override of provider
    if (process.env.REACT_APP_AI_PROVIDER === 'vercel') {
      config.aiProvider = 'vercel';
    } else if (process.env.REACT_APP_AI_PROVIDER === 'gemini-direct') {
      config.aiProvider = 'gemini-direct';
    } else if (process.env.REACT_APP_AI_PROVIDER === 'kimi-direct') {
      config.aiProvider = 'kimi-direct';
    }

    if (process.env.REACT_APP_AI_TIMEOUT) {
      config.aiTimeout = parseInt(process.env.REACT_APP_AI_TIMEOUT, 10) || 8000;
    }

    if (process.env.REACT_APP_AI_MAX_RETRIES) {
      config.aiMaxRetries = parseInt(process.env.REACT_APP_AI_MAX_RETRIES, 10) || 3;
    }

    if (
      process.env.NODE_ENV === 'development' ||
      process.env.REACT_APP_ENV === 'development'
    ) {
      config.environment = 'development';
    } else if (process.env.REACT_APP_ENV === 'staging') {
      config.environment = 'staging';
    }
  }

  return config;
};

export const config = getConfig();

export * from './caddi';

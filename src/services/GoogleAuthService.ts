import { Platform } from 'react-native';
import { config } from '../config';
import { LoggerService } from './LoggerService';

interface GoogleSigninLike {
  configure: (config: {
    scopes?: string[];
    webClientId?: string;
    iosClientId?: string;
    offlineAccess?: boolean;
    forceCodeForRefreshToken?: boolean;
  }) => void;
  hasPlayServices: (options?: {
    showPlayServicesUpdateDialog?: boolean;
  }) => Promise<unknown>;
  signIn: () => Promise<unknown>;
  signInSilently: () => Promise<unknown>;
  getTokens: () => Promise<{ accessToken: string }>;
  getCurrentUser?: () => Promise<{
    scopes?: string[];
    user?: { email?: string };
  } | null>;
}

const getGoogleSignin = (): GoogleSigninLike | null => {
  try {
    const googleModule = require('@react-native-google-signin/google-signin') as {
      GoogleSignin?: GoogleSigninLike;
    };
    return googleModule.GoogleSignin || null;
  } catch {
    return null;
  }
};

export class GoogleAuthService {
  private configured = false;

  constructor(private readonly scopes: string[]) {}

  configureGoogleSignIn(webClientId?: string, iosClientId?: string): void {
    const googleSignin = getGoogleSignin();
    if (!googleSignin) {
      return;
    }

    googleSignin.configure({
      scopes: this.scopes,
      webClientId,
      iosClientId,
      offlineAccess: Boolean(webClientId),
      forceCodeForRefreshToken: false,
    });
    this.configured = true;
  }

  private ensureConfigured(): void {
    if (this.configured) {
      return;
    }

    this.configureGoogleSignIn(config.googleWebClientId, config.googleIosClientId);
  }

  async getCurrentUserScopes(): Promise<string[] | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    this.ensureConfigured();
    try {
      const googleSignin = getGoogleSignin();
      const user = await googleSignin?.getCurrentUser?.();
      return Array.isArray(user?.scopes)
        ? user.scopes.filter((scope): scope is string => typeof scope === 'string')
        : null;
    } catch {
      return null;
    }
  }

  async getCurrentUserEmail(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    this.ensureConfigured();
    try {
      const googleSignin = getGoogleSignin();
      const user = await googleSignin?.getCurrentUser?.();
      return typeof user?.user?.email === 'string' ? user.user.email : null;
    } catch {
      return null;
    }
  }

  async signInInteractive(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    this.ensureConfigured();
    try {
      const googleSignin = getGoogleSignin();
      if (!googleSignin) {
        return false;
      }

      await googleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      await googleSignin.signIn();
      return true;
    } catch (error) {
      LoggerService.error({
        service: 'GoogleAuthService',
        operation: 'signInInteractive',
        message: 'Google sign-in failed',
        error,
      });
      return false;
    }
  }

  async getAccessToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    this.ensureConfigured();
    try {
      const googleSignin = getGoogleSignin();
      if (!googleSignin) {
        return null;
      }

      await googleSignin.signInSilently();
      const tokens = await googleSignin.getTokens();
      return tokens.accessToken;
    } catch {
      return null;
    }
  }
}

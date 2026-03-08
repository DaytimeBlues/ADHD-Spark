/// <reference lib="dom" />
import { config } from '../config';
import { LoggerService } from './LoggerService';
import { isWeb } from '../utils/PlatformUtils';
import { getWebRedirectUri } from '../config/paths';

/**
 * OAuthService
 *
 * Handles OAuth flows for Google and Todoist integrations.
 * Uses backend-assisted flow for web security (PKCE).
 * Native uses direct SDK where available.
 */

const API_BASE_URL = config.apiBaseUrl;

// Storage keys
const STORAGE_KEYS = {
  googleAuth: 'googleAuth',
  todoistAuth: 'todoistAuth',
  oauthState: 'oauthState',
  codeVerifier: 'codeVerifier',
};

// OAuth state
interface OAuthState {
  provider: 'google' | 'todoist';
  state: string;
  redirectUri: string;
  timestamp: number;
}

// Auth data interfaces
export interface GoogleAuthData {
  connected: boolean;
  accessToken?: string;
  /** @deprecated Web should not persist refresh tokens client-side. */
  refreshToken?: string;
  expiresAt?: number;
  email?: string;
  name?: string;
  picture?: string;
}

export interface TodoistAuthData {
  connected: boolean;
  accessToken?: string;
  email?: string;
  name?: string;
}

class OAuthServiceClass {
  private popupWindow: Window | null = null;
  private messageHandler: ((event: MessageEvent) => void) | null = null;

  // ==================== PKCE Helpers ====================

  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return this.base64URLEncode(new Uint8Array(digest));
  }

  private base64URLEncode(buffer: Uint8Array): string {
    return btoa(String.fromCharCode(...buffer))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/[=]/g, '');
  }

  // ==================== Storage Helpers ====================

  private async getStorageItem(key: string): Promise<string | null> {
    if (isWeb) {
      return localStorage.getItem(key);
    }
    // Native: use AsyncStorage or similar
    const { default: AsyncStorage } = await import(
      '@react-native-async-storage/async-storage'
    );
    return AsyncStorage.getItem(key);
  }

  private async setStorageItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      localStorage.setItem(key, value);
      return;
    }
    const { default: AsyncStorage } = await import(
      '@react-native-async-storage/async-storage'
    );
    await AsyncStorage.setItem(key, value);
  }

  private async removeStorageItem(key: string): Promise<void> {
    if (isWeb) {
      localStorage.removeItem(key);
      return;
    }
    const { default: AsyncStorage } = await import(
      '@react-native-async-storage/async-storage'
    );
    await AsyncStorage.removeItem(key);
  }

  // ==================== Google OAuth ====================

  async initiateGoogleAuth(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!isWeb) {
        // Native: use Google Sign-In SDK
        return this.initiateGoogleAuthNative();
      }

      // Web: use backend-assisted PKCE flow
      const redirectUri = getWebRedirectUri(window.location.origin);
      const codeVerifier = this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);

      // Store code verifier for later
      await this.setStorageItem(STORAGE_KEYS.codeVerifier, codeVerifier);

      // Call backend to get auth URL
      const response = await fetch(`${API_BASE_URL}/api/google-oauth-init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          redirectUri,
          codeChallenge,
          codeChallengeMethod: 'S256',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate OAuth');
      }

      const { authUrl, state } = await response.json();

      // Store OAuth state
      const oauthState: OAuthState = {
        provider: 'google',
        state,
        redirectUri,
        timestamp: Date.now(),
      };
      await this.setStorageItem(
        STORAGE_KEYS.oauthState,
        JSON.stringify(oauthState),
      );

      // Open popup for OAuth
      return this.openOAuthPopup(authUrl, state, 'google');
    } catch (error) {
      LoggerService.error({
        service: 'OAuthService',
        operation: 'initiateGoogleAuth',
        message: 'Failed to initiate Google OAuth',
        error,
      });
      return { success: false, error: 'Failed to initiate authentication' };
    }
  }

  private async initiateGoogleAuthNative(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { GoogleSignin } = await import(
        '@react-native-google-signin/google-signin'
      );

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const userInfo = await GoogleSignin.signIn();

      const tokens = await GoogleSignin.getTokens();

      const authData: GoogleAuthData = {
        connected: true,
        accessToken: tokens.accessToken,
        email: userInfo.data?.user.email,
        name: userInfo.data?.user.name ?? undefined,
        picture: userInfo.data?.user.photo ?? undefined,
      };

      await this.setStorageItem(
        STORAGE_KEYS.googleAuth,
        JSON.stringify(authData),
      );

      return { success: true };
    } catch (error) {
      LoggerService.error({
        service: 'OAuthService',
        operation: 'initiateGoogleAuthNative',
        message: 'Native Google auth failed',
        error,
      });
      return { success: false, error: 'Google sign-in failed' };
    }
  }

  // ==================== Todoist OAuth ====================

  async initiateTodoistAuth(): Promise<{ success: boolean; error?: string }> {
    try {
      const redirectUri = isWeb
        ? getWebRedirectUri(window.location.origin)
        : 'com.adhdcaddi:/oauth2callback';

      const response = await fetch(`${API_BASE_URL}/api/todoist-oauth-init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirectUri }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate Todoist OAuth');
      }

      const { authUrl, state } = await response.json();

      // Store OAuth state
      const oauthState: OAuthState = {
        provider: 'todoist',
        state,
        redirectUri,
        timestamp: Date.now(),
      };
      await this.setStorageItem(
        STORAGE_KEYS.oauthState,
        JSON.stringify(oauthState),
      );

      // Open popup for OAuth
      return this.openOAuthPopup(authUrl, state, 'todoist');
    } catch (error) {
      LoggerService.error({
        service: 'OAuthService',
        operation: 'initiateTodoistAuth',
        message: 'Failed to initiate Todoist OAuth',
        error,
      });
      return { success: false, error: 'Failed to initiate authentication' };
    }
  }

  // ==================== OAuth Popup Handling ====================

  private openOAuthPopup(
    authUrl: string,
    state: string,
    provider: 'google' | 'todoist',
  ): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (!isWeb) {
        // Native: use Linking or WebBrowser
        resolve({ success: false, error: 'Native OAuth not implemented' });
        return;
      }

      // Open popup
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      this.popupWindow = window.open(
        authUrl,
        'oauth',
        `width=${width},height=${height},left=${left},top=${top}`,
      );

      if (!this.popupWindow) {
        resolve({
          success: false,
          error: 'Popup blocked. Please allow popups for this site.',
        });
        return;
      }

      // Listen for messages from popup
      this.messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) {
          return;
        }

        const { type, code, receivedState, error } = event.data;

        if (type === 'oauth-callback') {
          this.cleanupPopup();

          if (error) {
            resolve({ success: false, error });
            return;
          }

          if (receivedState !== state) {
            resolve({ success: false, error: 'Invalid state parameter' });
            return;
          }

          // Exchange code for tokens
          this.exchangeCodeForTokens(code, provider, state).then((result) => {
            resolve(result);
          });
        }
      };

      window.addEventListener('message', this.messageHandler);

      // Timeout after 5 minutes
      setTimeout(
        () => {
          this.cleanupPopup();
          resolve({ success: false, error: 'Authentication timed out' });
        },
        5 * 60 * 1000,
      );
    });
  }

  private cleanupPopup(): void {
    if (this.popupWindow && !this.popupWindow.closed) {
      this.popupWindow.close();
    }
    this.popupWindow = null;

    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }
  }

  // ==================== Token Exchange ====================

  private async exchangeCodeForTokens(
    code: string,
    provider: 'google' | 'todoist',
    state: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const oauthStateJson = await this.getStorageItem(STORAGE_KEYS.oauthState);
      if (!oauthStateJson) {
        return { success: false, error: 'OAuth state not found' };
      }

      const oauthState: OAuthState = JSON.parse(oauthStateJson);

      // Verify state hasn't expired (10 minute window)
      if (Date.now() - oauthState.timestamp > 10 * 60 * 1000) {
        return { success: false, error: 'Authentication expired' };
      }

      const endpoint =
        provider === 'google'
          ? '/api/google-oauth-callback'
          : '/api/todoist-oauth-callback';

      const body: Record<string, string> = {
        code,
        state,
        expectedState: oauthState.state,
        redirectUri: oauthState.redirectUri,
      };

      // Add PKCE verifier for Google
      if (provider === 'google') {
        const codeVerifier = await this.getStorageItem(
          STORAGE_KEYS.codeVerifier,
        );
        if (codeVerifier) {
          body.codeVerifier = codeVerifier;
        }
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Token exchange failed',
        };
      }

      const data = await response.json();

      // Store auth data
      if (provider === 'google') {
        const authData: GoogleAuthData = {
          connected: true,
          accessToken: data.accessToken,
          expiresAt: Date.now() + data.expiresIn * 1000,
          email: data.email,
          name: data.name,
          picture: data.picture,
        };
        await this.setStorageItem(
          STORAGE_KEYS.googleAuth,
          JSON.stringify(authData),
        );
      } else {
        const authData: TodoistAuthData = {
          connected: true,
          accessToken: data.accessToken,
          email: data.email,
          name: data.name,
        };
        await this.setStorageItem(
          STORAGE_KEYS.todoistAuth,
          JSON.stringify(authData),
        );
      }

      // Clean up
      await this.removeStorageItem(STORAGE_KEYS.oauthState);
      await this.removeStorageItem(STORAGE_KEYS.codeVerifier);

      return { success: true };
    } catch (error) {
      LoggerService.error({
        service: 'OAuthService',
        operation: 'exchangeCodeForTokens',
        message: 'Token exchange failed',
        error,
      });
      return { success: false, error: 'Failed to complete authentication' };
    }
  }

  // ==================== Public API ====================

  async getGoogleAuth(): Promise<GoogleAuthData | null> {
    const data = await this.getStorageItem(STORAGE_KEYS.googleAuth);
    return data ? JSON.parse(data) : null;
  }

  async getTodoistAuth(): Promise<TodoistAuthData | null> {
    const data = await this.getStorageItem(STORAGE_KEYS.todoistAuth);
    return data ? JSON.parse(data) : null;
  }

  async disconnectGoogle(): Promise<void> {
    await this.removeStorageItem(STORAGE_KEYS.googleAuth);
  }

  async disconnectTodoist(): Promise<void> {
    await this.removeStorageItem(STORAGE_KEYS.todoistAuth);
  }

  async refreshGoogleToken(): Promise<boolean> {
    const auth = await this.getGoogleAuth();
    if (!auth?.connected) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/google-refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          auth.refreshToken ? { refreshToken: auth.refreshToken } : {},
        ),
      });

      if (!response.ok) {
        // Token refresh failed, clear auth
        await this.disconnectGoogle();
        return false;
      }

      const data = await response.json();

      const safeAuth: GoogleAuthData = { ...auth };
      delete safeAuth.refreshToken;
      const newAuth: GoogleAuthData = {
        ...safeAuth,
        accessToken: data.accessToken,
        expiresAt: Date.now() + data.expiresIn * 1000,
      };

      await this.setStorageItem(
        STORAGE_KEYS.googleAuth,
        JSON.stringify(newAuth),
      );
      return true;
    } catch (error) {
      LoggerService.error({
        service: 'OAuthService',
        operation: 'refreshGoogleToken',
        message: 'Token refresh failed',
        error,
      });
      return false;
    }
  }

  async isGoogleTokenValid(): Promise<boolean> {
    const auth = await this.getGoogleAuth();
    if (!auth?.connected || !auth.expiresAt) {
      return false;
    }

    // Token expires 5 minutes before actual expiry
    return Date.now() < auth.expiresAt - 5 * 60 * 1000;
  }
}

export const OAuthService = new OAuthServiceClass();
export default OAuthService;

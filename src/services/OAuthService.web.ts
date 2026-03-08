/// <reference lib="dom" />
import { config } from '../config';
import { LoggerService } from './LoggerService';
import { getWebRedirectUri } from '../config/paths';

/**
 * OAuthService (Web Version)
 *
 * Handles OAuth flows for Google and Todoist integrations on web.
 * Uses backend-assisted flow with PKCE for security.
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
    return localStorage.getItem(key);
  }

  private async setStorageItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }

  private async removeStorageItem(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  // ==================== Google OAuth ====================

  async initiateGoogleAuth(): Promise<{ success: boolean; error?: string }> {
    try {
      const redirectUri = getWebRedirectUri(window.location.origin);
      const codeVerifier = this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);

      await this.setStorageItem(STORAGE_KEYS.codeVerifier, codeVerifier);

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

  // ==================== Todoist OAuth ====================

  async initiateTodoistAuth(): Promise<{ success: boolean; error?: string }> {
    try {
      const redirectUri = getWebRedirectUri(window.location.origin);

      const response = await fetch(`${API_BASE_URL}/api/todoist-oauth-init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirectUri }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate Todoist OAuth');
      }

      const { authUrl, state } = await response.json();

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

          this.exchangeCodeForTokens(code, provider, state).then((result) => {
            resolve(result);
          });
        }
      };

      window.addEventListener('message', this.messageHandler);

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

    return Date.now() < auth.expiresAt - 5 * 60 * 1000;
  }
}

export const OAuthService = new OAuthServiceClass();
export default OAuthService;

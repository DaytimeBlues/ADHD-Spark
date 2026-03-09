import { config } from '../../config';
import { LoggerService } from '../LoggerService';
import {
  buildOAuthState,
  getOAuthCallbackEndpoint,
  getOAuthInitEndpoint,
  isOAuthStateExpired,
  sanitizeGoogleAuthData,
  sanitizeGoogleAuthForStorage,
  sanitizeTodoistAuthForStorage,
  STORAGE_KEYS,
  type GoogleAuthData,
  type OAuthStorageMode,
  type OAuthProvider,
  type OAuthState,
  type OAuthStorageAdapter,
  type TodoistAuthData,
} from './OAuthShared';

const API_BASE_URL = config.apiBaseUrl;

export abstract class OAuthBase {
  constructor(protected readonly storage: OAuthStorageAdapter) {}

  protected abstract getRedirectUri(provider: OAuthProvider): string;

  protected abstract openOAuthPopup(
    authUrl: string,
    state: string,
    provider: OAuthProvider,
    exchangeCode: (
      code: string,
      provider: OAuthProvider,
      state: string,
    ) => Promise<{ success: boolean; error?: string }>,
  ): Promise<{ success: boolean; error?: string }>;

  protected getStorageMode(): OAuthStorageMode {
    return 'full';
  }

  async initiateGoogleAuth(): Promise<{ success: boolean; error?: string }> {
    return this.initiateBackendOAuth('google');
  }

  async initiateTodoistAuth(): Promise<{ success: boolean; error?: string }> {
    return this.initiateBackendOAuth('todoist');
  }

  protected async buildInitPayload(
    provider: OAuthProvider,
    redirectUri: string,
  ): Promise<Record<string, string>> {
    return { redirectUri };
  }

  protected async initiateBackendOAuth(
    provider: OAuthProvider,
  ): Promise<{ success: boolean; error?: string }> {
    const operation =
      provider === 'google' ? 'initiateGoogleAuth' : 'initiateTodoistAuth';

    try {
      const redirectUri = this.getRedirectUri(provider);
      const payload = await this.buildInitPayload(provider, redirectUri);
      const response = await fetch(
        `${API_BASE_URL}${getOAuthInitEndpoint(provider)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to initiate ${provider} OAuth`);
      }

      const { authUrl, state } = await response.json();
      await this.storage.setItem(
        STORAGE_KEYS.oauthState,
        JSON.stringify(buildOAuthState(provider, state, redirectUri)),
      );

      return this.openOAuthPopup(authUrl, state, provider, (code, kind, s) =>
        this.exchangeCodeForTokens(code, kind, s),
      );
    } catch (error) {
      LoggerService.error({
        service: 'OAuthService',
        operation,
        message: `Failed to initiate ${provider} OAuth`,
        error,
      });
      return { success: false, error: 'Failed to initiate authentication' };
    }
  }

  protected async exchangeCodeForTokens(
    code: string,
    provider: OAuthProvider,
    state: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const oauthStateJson = await this.storage.getItem(
        STORAGE_KEYS.oauthState,
      );
      if (!oauthStateJson) {
        return { success: false, error: 'OAuth state not found' };
      }

      const oauthState: OAuthState = JSON.parse(oauthStateJson);
      if (isOAuthStateExpired(oauthState)) {
        return { success: false, error: 'Authentication expired' };
      }

      const body: Record<string, string> = {
        code,
        state,
        expectedState: oauthState.state,
        redirectUri: oauthState.redirectUri,
      };

      if (provider === 'google') {
        const codeVerifier = await this.storage.getItem(
          STORAGE_KEYS.codeVerifier,
        );
        if (codeVerifier) {
          body.codeVerifier = codeVerifier;
        }
      }

      const response = await fetch(
        `${API_BASE_URL}${getOAuthCallbackEndpoint(provider)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Token exchange failed',
        };
      }

      const data = await response.json();
      await this.storeAuthData(provider, data);
      await this.storage.removeItem(STORAGE_KEYS.oauthState);
      await this.storage.removeItem(STORAGE_KEYS.codeVerifier);

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

  protected async storeAuthData(
    provider: OAuthProvider,
    data: Record<string, unknown>,
  ): Promise<void> {
    const storageMode = this.getStorageMode();

    if (provider === 'google') {
      const authData: GoogleAuthData = {
        connected: true,
        accessToken: data.accessToken as string | undefined,
        expiresAt:
          typeof data.expiresIn === 'number'
            ? Date.now() + data.expiresIn * 1000
            : undefined,
        email: data.email as string | undefined,
        name: data.name as string | undefined,
        picture: data.picture as string | undefined,
      };
      await this.storage.setItem(
        STORAGE_KEYS.googleAuth,
        JSON.stringify(sanitizeGoogleAuthForStorage(authData, storageMode)),
      );
      return;
    }

    const authData: TodoistAuthData = {
      connected: true,
      accessToken: data.accessToken as string | undefined,
      email: data.email as string | undefined,
      name: data.name as string | undefined,
    };
    await this.storage.setItem(
      STORAGE_KEYS.todoistAuth,
      JSON.stringify(sanitizeTodoistAuthForStorage(authData, storageMode)),
    );
  }

  async getGoogleAuth(): Promise<GoogleAuthData | null> {
    const data = await this.storage.getItem(STORAGE_KEYS.googleAuth);
    return data ? JSON.parse(data) : null;
  }

  async getTodoistAuth(): Promise<TodoistAuthData | null> {
    const data = await this.storage.getItem(STORAGE_KEYS.todoistAuth);
    return data ? JSON.parse(data) : null;
  }

  async disconnectGoogle(): Promise<void> {
    await this.storage.removeItem(STORAGE_KEYS.googleAuth);
  }

  async disconnectTodoist(): Promise<void> {
    await this.storage.removeItem(STORAGE_KEYS.todoistAuth);
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
      const newAuth: GoogleAuthData = {
        ...sanitizeGoogleAuthData(auth),
        accessToken: data.accessToken,
        expiresAt: Date.now() + data.expiresIn * 1000,
      };

      await this.storage.setItem(
        STORAGE_KEYS.googleAuth,
        JSON.stringify(
          sanitizeGoogleAuthForStorage(newAuth, this.getStorageMode()),
        ),
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

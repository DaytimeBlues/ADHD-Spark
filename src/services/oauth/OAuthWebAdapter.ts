/// <reference lib="dom" />
import { getWebRedirectUri } from '../../config/paths';
import {
  STORAGE_KEYS,
  type OAuthProvider,
  type OAuthStorageMode,
} from './OAuthShared';
import { OAuthBase } from './OAuthBase';

const base64UrlEncode = (buffer: Uint8Array): string =>
  btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/[=]/g, '');

export class OAuthWebAdapter extends OAuthBase {
  private popupWindow: Window | null = null;
  private messageHandler: ((event: MessageEvent) => void) | null = null;

  protected getStorageMode(): OAuthStorageMode {
    return 'metadata-only';
  }

  async initiateGoogleAuth(): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error:
        'Google connect on web is disabled until session-backed web sync is available.',
    };
  }

  async initiateTodoistAuth(): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error:
        'Todoist connect on web is disabled until session-backed web sync is available.',
    };
  }

  protected getRedirectUri(): string {
    return getWebRedirectUri(window.location.origin);
  }

  protected async buildInitPayload(
    provider: OAuthProvider,
    redirectUri: string,
  ): Promise<Record<string, string>> {
    if (provider !== 'google') {
      return { redirectUri };
    }

    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    await this.storage.setItem(STORAGE_KEYS.codeVerifier, codeVerifier);

    return {
      redirectUri,
      codeChallenge,
      codeChallengeMethod: 'S256',
    };
  }

  protected openOAuthPopup(
    authUrl: string,
    state: string,
    provider: OAuthProvider,
    exchangeCode: (
      code: string,
      currentProvider: OAuthProvider,
      currentState: string,
    ) => Promise<{ success: boolean; error?: string }>,
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
        if (type !== 'oauth-callback') {
          return;
        }

        this.cleanupPopup();
        if (error) {
          resolve({ success: false, error });
          return;
        }

        if (receivedState !== state) {
          resolve({ success: false, error: 'Invalid state parameter' });
          return;
        }

        exchangeCode(code, provider, state).then(resolve);
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

  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return base64UrlEncode(array);
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return base64UrlEncode(new Uint8Array(digest));
  }
}

export type OAuthProvider = 'google' | 'todoist';

export interface OAuthState {
  provider: OAuthProvider;
  state: string;
  redirectUri: string;
  timestamp: number;
}

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

export interface OAuthStorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

export type OAuthStorageMode = 'full' | 'metadata-only';

export const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

export const STORAGE_KEYS = {
  googleAuth: 'googleAuth',
  todoistAuth: 'todoistAuth',
  oauthState: 'oauthState',
  codeVerifier: 'codeVerifier',
} as const;

export const buildOAuthState = (
  provider: OAuthProvider,
  state: string,
  redirectUri: string,
  now = Date.now(),
): OAuthState => ({
  provider,
  state,
  redirectUri,
  timestamp: now,
});

export const isOAuthStateExpired = (
  state: Pick<OAuthState, 'timestamp'>,
  now = Date.now(),
): boolean => now - state.timestamp > OAUTH_STATE_TTL_MS;

export const sanitizeGoogleAuthData = (
  auth: GoogleAuthData,
): Omit<GoogleAuthData, 'refreshToken'> => {
  const safeAuth = { ...auth };
  delete safeAuth.refreshToken;
  return safeAuth;
};

export const sanitizeGoogleAuthForStorage = (
  auth: GoogleAuthData,
  storageMode: OAuthStorageMode,
): Omit<GoogleAuthData, 'refreshToken'> => {
  const safeAuth = sanitizeGoogleAuthData(auth);

  if (storageMode === 'metadata-only') {
    delete safeAuth.accessToken;
  }

  return safeAuth;
};

export const sanitizeTodoistAuthForStorage = (
  auth: TodoistAuthData,
  storageMode: OAuthStorageMode,
): TodoistAuthData => {
  const safeAuth = { ...auth };

  if (storageMode === 'metadata-only') {
    delete safeAuth.accessToken;
  }

  return safeAuth;
};

export const getOAuthCallbackEndpoint = (provider: OAuthProvider): string =>
  provider === 'google'
    ? '/api/google-oauth-callback'
    : '/api/todoist-oauth-callback';

export const getOAuthInitEndpoint = (provider: OAuthProvider): string =>
  provider === 'google' ? '/api/google-oauth-init' : '/api/todoist-oauth-init';

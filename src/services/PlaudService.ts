import { Platform } from 'react-native';
import { config } from '../config';
import { SortedItem } from './AISortService';
import StorageService from './StorageService';
import OverlayService from './OverlayService';

/**
 * PlaudService
 *
 * Handles communication with the Spark ADHD API middleware
 * for Plaud AI transcription.
 */

export interface TranscriptionResult {
  success: boolean;
  transcription?: string;
  summary?: string;
  error?: string;
}

interface GoogleTaskItem {
  id: string;
  title?: string;
  notes?: string;
  updated?: string;
  status?: 'needsAction' | 'completed';
  deleted?: boolean;
}

interface GoogleTasksListResponse {
  items?: GoogleTaskItem[];
  nextPageToken?: string;
  nextSyncToken?: string;
}

interface GoogleTasksSyncState {
  listId?: string;
  syncToken?: string;
}

interface BrainDumpItem {
  id: string;
  text: string;
  createdAt: string;
  source: 'text' | 'audio' | 'google';
  googleTaskId?: string;
}

interface GoogleTasksSyncResult {
  importedCount: number;
  skippedCount: number;
  markedCompletedCount: number;
  syncTokenUpdated: boolean;
}

export interface GoogleExportResult {
  createdTasks: number;
  createdEvents: number;
  skippedCount: number;
  authRequired: boolean;
  errorCode?:
    | 'auth_required'
    | 'auth_failed'
    | 'network'
    | 'rate_limited'
    | 'api_error';
  errorMessage?: string;
}

const GOOGLE_TASKS_SCOPE = 'https://www.googleapis.com/auth/tasks';
const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const GOOGLE_TASKS_API_BASE = 'https://tasks.googleapis.com/tasks/v1';
const GOOGLE_CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';
const GOOGLE_TASKS_INBOX_NAME = 'Spark Inbox';
const MAX_PROCESSED_IDS = 500;
const MAX_MARK_CONCURRENCY = 4;
const MAX_EXPORTED_FINGERPRINTS = 1000;
const GOOGLE_RETRY_DELAYS_MS = [350, 900, 1800] as const;
const GOOGLE_RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

class GoogleApiError extends Error {
  readonly status?: number;
  readonly retryable: boolean;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'GoogleApiError';
    this.status = status;
    this.retryable =
      status === undefined ? true : GOOGLE_RETRYABLE_STATUS.has(status);
  }
}

type RNFormDataFile = {
  uri: string;
  type: string;
  name: string;
};

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
}

const getGoogleSignin = (): GoogleSigninLike | null => {
  try {
    const googleModule =
      require('@react-native-google-signin/google-signin') as {
        GoogleSignin?: GoogleSigninLike;
      };
    return googleModule.GoogleSignin || null;
  } catch {
    return null;
  }
};

const generateSyncItemId = (): string => {
  return `google-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const ensureStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
};

const normalizeText = (value: string): string => {
  return value.trim().replace(/\s+/g, ' ');
};

const buildExportFingerprint = (item: SortedItem): string => {
  return [
    item.category,
    normalizeText(item.text).toLowerCase(),
    item.dueDate ?? '',
    item.start ?? '',
    item.end ?? '',
  ].join('|');
};

const toGoogleTaskDue = (dueDate?: string): string | undefined => {
  if (!dueDate) {
    return undefined;
  }
  return `${dueDate}T23:59:00.000Z`;
};

class PlaudServiceClass {
  private apiUrl: string;

  constructor() {
    this.apiUrl = config.apiBaseUrl;
  }

  /**
   * Set the API base URL (for testing or different environments)
   */
  setApiUrl(url: string): void {
    this.apiUrl = url;
  }

  /**
   * Upload audio file and get transcription
   *
   * @param audioUri - Local URI of the audio file
   * @returns Transcription result
   */
  async transcribe(audioUri: string): Promise<TranscriptionResult> {
    const globalRecord =
      typeof globalThis === 'undefined'
        ? null
        : (globalThis as unknown as Record<string, unknown>);
    if (globalRecord?.__SPARK_E2E_TEST_MODE__ === true) {
      const mockTranscription = globalRecord.__SPARK_E2E_TRANSCRIBE_MOCK__;
      if (typeof mockTranscription === 'string' && mockTranscription.trim()) {
        return {
          success: true,
          transcription: mockTranscription,
          summary: 'E2E mock transcription',
        };
      }
    }

    try {
      // Read audio file and create form data
      const formData = new FormData();

      // Handle different platforms
      if (Platform.OS === 'web') {
        // For web, fetch the blob
        const response = await fetch(audioUri);
        const blob = await response.blob();
        formData.append('audio', blob);
      } else {
        // For native, use file URI directly
        const file: RNFormDataFile = {
          uri: audioUri,
          type: 'audio/m4a',
          name: 'recording.m4a',
        };
        formData.append('audio', file as unknown as Blob);
      }

      // Send to middleware
      const response = await fetch(`${this.apiUrl}/api/transcribe`, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error:
            errorData.error || `Request failed with status ${response.status}`,
        };
      }

      const data = await response.json();

      return {
        success: true,
        transcription: data.transcription,
        summary: data.summary,
      };
    } catch (error) {
      console.error('Transcription error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if the Plaud API is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth`, {
        method: 'POST',
      });
      // Even a 500 means the server is reachable
      return response.status !== 0;
    } catch {
      return false;
    }
  }
}

class GoogleTasksSyncServiceClass {
  private configured = false;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private isSyncing = false;

  configureGoogleSignIn(webClientId?: string, iosClientId?: string): void {
    const googleSignin = getGoogleSignin();
    if (!googleSignin) {
      return;
    }

    googleSignin.configure({
      scopes: [GOOGLE_TASKS_SCOPE, GOOGLE_CALENDAR_SCOPE],
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

    this.configureGoogleSignIn(
      config.googleWebClientId,
      config.googleIosClientId,
    );
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
      console.error('Google sign-in failed:', error);
      return false;
    }
  }

  private async getAccessToken(): Promise<string | null> {
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

  private async readSyncState(): Promise<GoogleTasksSyncState> {
    const state = await StorageService.getJSON<GoogleTasksSyncState>(
      StorageService.STORAGE_KEYS.googleTasksSyncState,
    );

    if (!state || typeof state !== 'object') {
      return {};
    }

    return {
      listId: typeof state.listId === 'string' ? state.listId : undefined,
      syncToken:
        typeof state.syncToken === 'string' ? state.syncToken : undefined,
    };
  }

  private async writeSyncState(nextState: GoogleTasksSyncState): Promise<void> {
    await StorageService.setJSON(
      StorageService.STORAGE_KEYS.googleTasksSyncState,
      nextState,
    );
  }

  private async getProcessedIds(): Promise<string[]> {
    const value = await StorageService.getJSON<unknown>(
      StorageService.STORAGE_KEYS.googleTasksProcessedIds,
    );
    return ensureStringArray(value);
  }

  private async setProcessedIds(ids: string[]): Promise<void> {
    const unique = Array.from(new Set(ids)).slice(-MAX_PROCESSED_IDS);
    await StorageService.setJSON(
      StorageService.STORAGE_KEYS.googleTasksProcessedIds,
      unique,
    );
  }

  private async request<T>(
    accessToken: string,
    endpoint: string,
    init?: RequestInit,
  ): Promise<T> {
    return this.withRetry(async () => {
      let response: Response;

      try {
        response = await fetch(`${GOOGLE_TASKS_API_BASE}${endpoint}`, {
          ...init,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
          },
        });
      } catch (error) {
        throw new GoogleApiError(
          `Google Tasks network request failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }

      if (response.status === 410) {
        throw new Error('GOOGLE_SYNC_TOKEN_EXPIRED');
      }

      if (!response.ok) {
        const payload = await response.text();
        throw new GoogleApiError(
          `Google Tasks API error (${response.status}): ${payload}`,
          response.status,
        );
      }

      return (await response.json()) as T;
    });
  }

  private isAuthError(error: unknown): boolean {
    return (
      error instanceof GoogleApiError &&
      (error.status === 401 || error.status === 403)
    );
  }

  private toExportError(error: unknown): {
    code: GoogleExportResult['errorCode'];
    message: string;
    authRequired: boolean;
  } {
    if (this.isAuthError(error)) {
      return {
        code: 'auth_failed',
        message:
          'Google authorization expired. Sign in again to continue Task/Calendar sync.',
        authRequired: true,
      };
    }

    if (error instanceof GoogleApiError) {
      if (error.status === 429) {
        return {
          code: 'rate_limited',
          message:
            'Google API rate limit reached. Try sync again in a moment.',
          authRequired: false,
        };
      }

      return {
        code: error.status === undefined ? 'network' : 'api_error',
        message:
          error.status === undefined
            ? 'Network issue while syncing with Google. Check your connection and retry.'
            : 'Google sync request failed. Try again shortly.',
        authRequired: false,
      };
    }

    return {
      code: 'api_error',
      message: 'Google sync failed unexpectedly. Try again shortly.',
      authRequired: false,
    };
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let attempt = 0;

    while (true) {
      try {
        return await operation();
      } catch (error) {
        const isRetryable =
          error instanceof GoogleApiError && error.retryable === true;

        if (!isRetryable || attempt >= GOOGLE_RETRY_DELAYS_MS.length) {
          throw error;
        }

        const delayMs = GOOGLE_RETRY_DELAYS_MS[attempt];
        attempt += 1;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  private async ensureSparkInboxList(accessToken: string): Promise<string> {
    const lists = await this.request<{
      items?: Array<{ id: string; title?: string }>;
    }>(accessToken, '/users/@me/lists');

    const existing = lists.items?.find(
      (list) => list.title === GOOGLE_TASKS_INBOX_NAME,
    );
    if (existing?.id) {
      return existing.id;
    }

    const created = await this.request<{ id: string }>(
      accessToken,
      '/users/@me/lists',
      {
        method: 'POST',
        body: JSON.stringify({ title: GOOGLE_TASKS_INBOX_NAME }),
      },
    );

    return created.id;
  }

  private async listDeltaTasks(
    accessToken: string,
    listId: string,
    syncToken?: string,
  ): Promise<{ items: GoogleTaskItem[]; nextSyncToken?: string }> {
    let pageToken: string | undefined;
    let nextSyncToken = syncToken;
    const allItems: GoogleTaskItem[] = [];

    do {
      const params = new URLSearchParams({
        maxResults: '100',
        showCompleted: 'true',
        showHidden: 'true',
        showDeleted: 'true',
      });

      if (syncToken) {
        params.set('syncToken', syncToken);
      }
      if (pageToken) {
        params.set('pageToken', pageToken);
      }

      const page = await this.request<GoogleTasksListResponse>(
        accessToken,
        `/lists/${encodeURIComponent(listId)}/tasks?${params.toString()}`,
      );

      if (Array.isArray(page.items)) {
        allItems.push(...page.items);
      }

      if (page.nextSyncToken) {
        nextSyncToken = page.nextSyncToken;
      }

      pageToken = page.nextPageToken;
    } while (pageToken);

    return { items: allItems, nextSyncToken };
  }

  private async markTaskCompleted(
    accessToken: string,
    listId: string,
    taskId: string,
  ): Promise<boolean> {
    try {
      await this.request(
        accessToken,
        `/lists/${encodeURIComponent(listId)}/tasks/${encodeURIComponent(taskId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'completed' }),
        },
      );
      return true;
    } catch (error) {
      console.error('Failed to mark Google task as completed:', error);
      return false;
    }
  }

  private async getExportedFingerprints(): Promise<string[]> {
    const value = await StorageService.getJSON<unknown>(
      StorageService.STORAGE_KEYS.googleTasksExportedFingerprints,
    );
    return ensureStringArray(value);
  }

  private async setExportedFingerprints(fingerprints: string[]): Promise<void> {
    const unique = Array.from(new Set(fingerprints)).slice(
      -MAX_EXPORTED_FINGERPRINTS,
    );
    await StorageService.setJSON(
      StorageService.STORAGE_KEYS.googleTasksExportedFingerprints,
      unique,
    );
  }

  private async createTask(
    accessToken: string,
    listId: string,
    item: SortedItem,
  ): Promise<boolean> {
    const title = normalizeText(item.text);
    if (!title) {
      return false;
    }

    const notes: string[] = [`Imported from Spark AI Sort (${item.category})`];
    if (item.start) {
      notes.push(`start: ${item.start}`);
    }
    if (item.end) {
      notes.push(`end: ${item.end}`);
    }

    try {
      await this.request(
        accessToken,
        `/lists/${encodeURIComponent(listId)}/tasks`,
        {
          method: 'POST',
          body: JSON.stringify({
            title,
            notes: notes.join('\n'),
            due: toGoogleTaskDue(item.dueDate),
          }),
        },
      );
      return true;
    } catch (error) {
      console.error('Failed to create Google task:', error);
      return false;
    }
  }

  private async createCalendarEvent(
    accessToken: string,
    item: SortedItem,
  ): Promise<boolean> {
    if (!item.start) {
      return false;
    }

    const end = item.end
      ? item.end
      : new Date(Date.parse(item.start) + 60 * 60 * 1000).toISOString();

    try {
      await this.withRetry(async () => {
        let response: Response;
        try {
          response = await fetch(
            `${GOOGLE_CALENDAR_API_BASE}/calendars/primary/events`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                summary: normalizeText(item.text),
                description: 'Created from Spark AI Sort event suggestion.',
                start: { dateTime: item.start },
                end: { dateTime: end },
              }),
            },
          );
        } catch (error) {
          throw new GoogleApiError(
            `Google Calendar network request failed: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          );
        }

        if (!response.ok) {
          const payload = await response.text();
          throw new GoogleApiError(
            `Google Calendar API error (${response.status}): ${payload}`,
            response.status,
          );
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to create Google Calendar event:', error);
      return false;
    }
  }

  async syncSortedItemsToGoogle(items: SortedItem[]): Promise<GoogleExportResult> {
    const result: GoogleExportResult = {
      createdTasks: 0,
      createdEvents: 0,
      skippedCount: 0,
      authRequired: false,
    };

    if (items.length === 0 || Platform.OS === 'web') {
      result.skippedCount = items.length;
      return result;
    }

    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      result.authRequired = true;
      result.errorCode = 'auth_required';
      result.errorMessage =
        'Google sign-in required to sync Tasks and Calendar exports.';
      result.skippedCount = items.length;
      return result;
    }

    let listId: string;
    try {
      listId = await this.ensureSparkInboxList(accessToken);
    } catch (error) {
      const exportError = this.toExportError(error);
      result.authRequired = exportError.authRequired;
      result.errorCode = exportError.code;
      result.errorMessage = exportError.message;
      result.skippedCount = items.length;
      return result;
    }
    const exportedFingerprints = await this.getExportedFingerprints();
    const exportedSet = new Set(exportedFingerprints);

    for (const item of items) {
      const fingerprint = buildExportFingerprint(item);
      if (exportedSet.has(fingerprint)) {
        result.skippedCount += 1;
        continue;
      }

      const normalizedItem: SortedItem = {
        ...item,
        text: normalizeText(item.text),
      };

      if (!normalizedItem.text) {
        result.skippedCount += 1;
        continue;
      }

      if (normalizedItem.category === 'event') {
        const eventCreated = await this.createCalendarEvent(
          accessToken,
          normalizedItem,
        );

        if (eventCreated) {
          result.createdEvents += 1;
          exportedSet.add(fingerprint);
          continue;
        }

        const fallbackTaskCreated = await this.createTask(
          accessToken,
          listId,
          normalizedItem,
        );
        if (fallbackTaskCreated) {
          result.createdTasks += 1;
          exportedSet.add(fingerprint);
        } else {
          result.skippedCount += 1;
        }
        continue;
      }

      if (
        normalizedItem.category === 'task' ||
        normalizedItem.category === 'reminder'
      ) {
        const taskCreated = await this.createTask(accessToken, listId, normalizedItem);
        if (taskCreated) {
          result.createdTasks += 1;
          exportedSet.add(fingerprint);
        } else {
          result.skippedCount += 1;
        }
        continue;
      }

      result.skippedCount += 1;
    }

    await this.setExportedFingerprints(Array.from(exportedSet));
    return result;
  }

  async syncToBrainDump(): Promise<GoogleTasksSyncResult> {
    const result: GoogleTasksSyncResult = {
      importedCount: 0,
      skippedCount: 0,
      markedCompletedCount: 0,
      syncTokenUpdated: false,
    };

    if (this.isSyncing) {
      return result;
    }

    this.isSyncing = true;
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return result;
      }

      const syncState = await this.readSyncState();
      const listId =
        syncState.listId || (await this.ensureSparkInboxList(accessToken));

      let delta: { items: GoogleTaskItem[]; nextSyncToken?: string };
      try {
        delta = await this.listDeltaTasks(
          accessToken,
          listId,
          syncState.syncToken,
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === 'GOOGLE_SYNC_TOKEN_EXPIRED'
        ) {
          delta = await this.listDeltaTasks(accessToken, listId);
        } else {
          throw error;
        }
      }

      const existingItems =
        (await StorageService.getJSON<BrainDumpItem[]>(
          StorageService.STORAGE_KEYS.brainDump,
        )) || [];
      const processedIds = await this.getProcessedIds();
      const processedSet = new Set(processedIds);
      const existingGoogleTaskIds = new Set(
        existingItems
          .map((item) => item.googleTaskId)
          .filter((taskId): taskId is string => typeof taskId === 'string'),
      );

      const pendingMarks: string[] = [];
      const importedItems: BrainDumpItem[] = [];

      for (const task of delta.items) {
        const title = task.title?.trim();
        if (!task.id || !title || task.deleted || task.status === 'completed') {
          result.skippedCount += 1;
          continue;
        }

        if (processedSet.has(task.id) || existingGoogleTaskIds.has(task.id)) {
          result.skippedCount += 1;
          continue;
        }

        importedItems.push({
          id: generateSyncItemId(),
          text: task.notes ? `${title}\n\n${task.notes}` : title,
          createdAt: task.updated || new Date().toISOString(),
          source: 'google',
          googleTaskId: task.id,
        });
        pendingMarks.push(task.id);
      }

      if (importedItems.length > 0) {
        const nextItems = [...importedItems, ...existingItems];
        await StorageService.setJSON(
          StorageService.STORAGE_KEYS.brainDump,
          nextItems,
        );
        OverlayService.updateCount(nextItems.length);
        result.importedCount = importedItems.length;
      }

      for (
        let index = 0;
        index < pendingMarks.length;
        index += MAX_MARK_CONCURRENCY
      ) {
        const chunk = pendingMarks.slice(index, index + MAX_MARK_CONCURRENCY);
        const markResults = await Promise.all(
          chunk.map((taskId) =>
            this.markTaskCompleted(accessToken, listId, taskId),
          ),
        );

        markResults.forEach((marked, chunkIndex) => {
          if (marked) {
            const taskId = chunk[chunkIndex];
            result.markedCompletedCount += 1;
            processedSet.add(taskId);
          }
        });
      }

      await this.setProcessedIds(Array.from(processedSet));

      const nextState: GoogleTasksSyncState = {
        listId,
        syncToken: delta.nextSyncToken,
      };

      await this.writeSyncState(nextState);
      if (delta.nextSyncToken && delta.nextSyncToken !== syncState.syncToken) {
        result.syncTokenUpdated = true;
      }

      await StorageService.set(
        StorageService.STORAGE_KEYS.googleTasksLastSyncAt,
        new Date().toISOString(),
      );

      return result;
    } finally {
      this.isSyncing = false;
    }
  }

  startForegroundPolling(intervalMs = 15 * 60 * 1000): void {
    if (Platform.OS === 'web') {
      return;
    }

    if (this.pollTimer) {
      return;
    }

    this.pollTimer = setInterval(() => {
      this.syncToBrainDump().catch((error) => {
        console.error('Foreground Google Tasks poll failed:', error);
      });
    }, intervalMs);
  }

  stopForegroundPolling(): void {
    if (!this.pollTimer) {
      return;
    }

    clearInterval(this.pollTimer);
    this.pollTimer = null;
  }
}

export const PlaudService = new PlaudServiceClass();
export const GoogleTasksSyncService = new GoogleTasksSyncServiceClass();
export default PlaudService;

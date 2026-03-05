import { SortedItem } from './AISortService';
import StorageService from './StorageService';
import OverlayService from './OverlayService';
import { LoggerService } from './LoggerService';
import { GoogleAuthService } from './GoogleAuthService';
import { isWeb } from '../utils/PlatformUtils';
import {
  googleTasksApiClient,
  GoogleTaskItem,
  GoogleApiError,
} from './GoogleTasksApiClient';

/**
 * GoogleTasksSyncService
 *
 * Handles synchronization between Spark and Google Tasks/Calendar.
 * Orchestrates high-level sync flows using GoogleTasksApiClient and GoogleAuthService.
 */

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

export interface GoogleTasksSyncResult {
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
const GOOGLE_TASKS_INBOX_NAME = 'Spark Inbox';
const MAX_PROCESSED_IDS = 500;
const MAX_MARK_CONCURRENCY = 4;
const MAX_EXPORT_CONCURRENCY = 4;
const MAX_EXPORTED_FINGERPRINTS = 1000;

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

class GoogleTasksSyncServiceClass {
  private readonly authService = new GoogleAuthService([
    GOOGLE_TASKS_SCOPE,
    GOOGLE_CALENDAR_SCOPE,
  ]);
  private readonly apiClient = googleTasksApiClient;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private isSyncing = false;

  configureGoogleSignIn(webClientId?: string, iosClientId?: string): void {
    this.authService.configureGoogleSignIn(webClientId, iosClientId);
  }

  async getCurrentUserScopes(): Promise<string[] | null> {
    return this.authService.getCurrentUserScopes();
  }

  async getCurrentUserEmail(): Promise<string | null> {
    return this.authService.getCurrentUserEmail();
  }

  async signInInteractive(): Promise<boolean> {
    return this.authService.signInInteractive();
  }

  private async getAccessToken(): Promise<string | null> {
    return this.authService.getAccessToken();
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
          message: 'Google API rate limit reached. Try sync again in a moment.',
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

    if (
      error instanceof Error &&
      error.message === 'GOOGLE_SYNC_TOKEN_EXPIRED'
    ) {
      return {
        code: 'api_error',
        message: 'Sync session expired. Retrying...',
        authRequired: false,
      };
    }

    return {
      code: 'api_error',
      message: 'Google sync failed unexpectedly. Try again shortly.',
      authRequired: false,
    };
  }

  private async ensureSparkInboxList(accessToken: string): Promise<string> {
    const lists = await this.apiClient.getTaskLists(accessToken);
    const existing = lists.find(
      (list) => list.title === GOOGLE_TASKS_INBOX_NAME,
    );
    if (existing?.id) {
      return existing.id;
    }

    return this.apiClient.createTaskList(accessToken, GOOGLE_TASKS_INBOX_NAME);
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
      const page = await this.apiClient.listTasks(accessToken, listId, {
        syncToken,
        pageToken,
      });

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

  async syncSortedItemsToGoogle(
    items: SortedItem[],
  ): Promise<GoogleExportResult> {
    const result: GoogleExportResult = {
      createdTasks: 0,
      createdEvents: 0,
      skippedCount: 0,
      authRequired: false,
    };

    if (items.length === 0 || isWeb) {
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

    for (let index = 0; index < items.length; index += MAX_EXPORT_CONCURRENCY) {
      const chunk = items.slice(index, index + MAX_EXPORT_CONCURRENCY);
      await Promise.allSettled(
        chunk.map(async (item) => {
          const fingerprint = buildExportFingerprint(item);
          if (exportedSet.has(fingerprint)) {
            result.skippedCount += 1;
            return;
          }

          const normalizedTextValue = normalizeText(item.text);
          if (!normalizedTextValue) {
            result.skippedCount += 1;
            return;
          }

          const normalizedItem: SortedItem = {
            ...item,
            text: normalizedTextValue,
          };

          if (normalizedItem.category === 'event') {
            const eventCreated = await this.apiClient.createCalendarEvent(
              accessToken,
              normalizedItem,
            );

            if (eventCreated) {
              result.createdEvents += 1;
              exportedSet.add(fingerprint);
              return;
            }

            const fallbackTaskCreated = await this.apiClient.createTask(
              accessToken,
              listId,
              normalizedItem,
              GOOGLE_TASKS_INBOX_NAME,
            );
            if (fallbackTaskCreated) {
              result.createdTasks += 1;
              exportedSet.add(fingerprint);
            } else {
              result.skippedCount += 1;
            }
            return;
          }

          if (
            normalizedItem.category === 'task' ||
            normalizedItem.category === 'reminder'
          ) {
            const taskCreated = await this.apiClient.createTask(
              accessToken,
              listId,
              normalizedItem,
              GOOGLE_TASKS_INBOX_NAME,
            );
            if (taskCreated) {
              result.createdTasks += 1;
              exportedSet.add(fingerprint);
            } else {
              result.skippedCount += 1;
            }
            return;
          }

          result.skippedCount += 1;
        }),
      );
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
            this.apiClient.markTaskCompleted(accessToken, listId, taskId),
          ),
        );

        markResults.forEach((marked: boolean, chunkIndex: number) => {
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
    if (isWeb) {
      return;
    }

    if (this.pollTimer) {
      return;
    }

    this.pollTimer = setInterval(() => {
      this.syncToBrainDump().catch((error) => {
        LoggerService.error({
          service: 'GoogleTasksSyncService',
          operation: 'startForegroundPolling',
          message: 'Foreground Google Tasks poll failed',
          error,
        });
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

export const GoogleTasksSyncService = new GoogleTasksSyncServiceClass();
export default GoogleTasksSyncService;

import { SortedItem } from './AISortService';
import OverlayService from './OverlayService';
import { LoggerService } from './LoggerService';
import { GoogleAuthService } from './GoogleAuthService';
import { isWeb } from '../utils/PlatformUtils';
import {
    googleTasksApiClient,
    GoogleTaskItem,
    GoogleApiError,
} from './GoogleTasksApiClient';
import NetInfo from '@react-native-community/netinfo';
import { GoogleSyncStateService } from './GoogleSyncStateService';
import StorageService from './StorageService';

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
const MAX_MARK_CONCURRENCY = 4;
const MAX_EXPORT_CONCURRENCY = 4;

const generateSyncItemId = (): string => {
    return `google-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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

class GoogleSyncOrchestratorClass {
    private readonly authService = new GoogleAuthService([
        GOOGLE_TASKS_SCOPE,
        GOOGLE_CALENDAR_SCOPE,
    ]);
    private readonly apiClient = googleTasksApiClient;
    private pollTimer: ReturnType<typeof setInterval> | null = null;
    private isSyncing = false;
    private readonly MAX_SYNC_RETRIES = 3;
    private readonly BASE_RETRY_DELAY_MS = 2000;
    private netInfoUnsubscribe: (() => void) | null = null;
    private offlineQueue: SortedItem[] = [];

    getAuthService() { return this.authService; }

    async ensureSparkInboxList(accessToken: string): Promise<string> {
        const lists = await this.apiClient.getTaskLists(accessToken);
        const existing = lists.find(
            (list) => list.title === GOOGLE_TASKS_INBOX_NAME,
        );
        if (existing?.id) {
            return existing.id;
        }
        return this.apiClient.createTaskList(accessToken, GOOGLE_TASKS_INBOX_NAME);
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
                message: 'Google authorization expired. Sign in again to continue Task/Calendar sync.',
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
                message: error.status === undefined
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

    async syncSortedItemsToGoogle(items: SortedItem[]): Promise<GoogleExportResult> {
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

        const networkState = await NetInfo.fetch();
        if (!networkState.isConnected) {
            this.offlineQueue.push(...items);
            result.skippedCount = items.length;
            result.errorCode = 'network';
            return result;
        }

        const accessToken = await this.authService.getAccessToken();
        if (!accessToken) {
            result.authRequired = true;
            result.errorCode = 'auth_required';
            result.skippedCount = items.length;
            return result;
        }

        try {
            const listId = await this.ensureSparkInboxList(accessToken);
            const exportedFingerprints = await GoogleSyncStateService.getExportedFingerprints();
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

                        const normalizedItem: SortedItem = { ...item, text: normalizedTextValue };

                        if (normalizedItem.category === 'event') {
                            const eventCreated = await this.apiClient.createCalendarEvent(accessToken, normalizedItem);
                            if (eventCreated) {
                                result.createdEvents += 1;
                                exportedSet.add(fingerprint);
                                return;
                            }
                        }

                        // Fallback for events or direct tasks
                        if (['task', 'reminder', 'event'].includes(normalizedItem.category)) {
                            const taskCreated = await this.apiClient.createTask(accessToken, listId, normalizedItem, GOOGLE_TASKS_INBOX_NAME);
                            if (taskCreated) {
                                result.createdTasks += 1;
                                exportedSet.add(fingerprint);
                            } else {
                                result.skippedCount += 1;
                            }
                        } else {
                            result.skippedCount += 1;
                        }
                    }),
                );
            }
            await GoogleSyncStateService.setExportedFingerprints(Array.from(exportedSet));
        } catch (error) {
            const exportError = this.toExportError(error);
            result.authRequired = exportError.authRequired;
            result.errorCode = exportError.code;
            result.errorMessage = exportError.message;
            result.skippedCount = items.length;
        }

        return result;
    }

    async syncToBrainDump(retryCount = 0): Promise<GoogleTasksSyncResult> {
        const result: GoogleTasksSyncResult = {
            importedCount: 0,
            skippedCount: 0,
            markedCompletedCount: 0,
            syncTokenUpdated: false,
        };

        if (this.isSyncing) return result;

        const networkState = await NetInfo.fetch();
        if (!networkState.isConnected) return result;

        this.isSyncing = true;
        try {
            const accessToken = await this.authService.getAccessToken();
            if (!accessToken) return result;

            const syncState = await GoogleSyncStateService.readSyncState();
            const listId = syncState.listId || (await this.ensureSparkInboxList(accessToken));

            let delta: { items: GoogleTaskItem[]; nextSyncToken?: string };
            try {
                delta = await this.listDeltaTasks(accessToken, listId, syncState.syncToken);
            } catch (error) {
                if (error instanceof Error && error.message === 'GOOGLE_SYNC_TOKEN_EXPIRED') {
                    delta = await this.listDeltaTasks(accessToken, listId);
                } else {
                    throw error;
                }
            }

            const existingItems = (await StorageService.getJSON<any[]>(StorageService.STORAGE_KEYS.brainDump)) || [];
            const processedIds = await GoogleSyncStateService.getProcessedIds();
            const processedSet = new Set(processedIds);
            const existingGoogleTaskIds = new Set(
                existingItems.map((item) => item.googleTaskId).filter(Boolean),
            );

            const pendingMarks: string[] = [];
            const importedItems: any[] = [];

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
                await StorageService.setJSON(StorageService.STORAGE_KEYS.brainDump, nextItems);
                OverlayService.updateCount(nextItems.length);
                result.importedCount = importedItems.length;
            }

            for (let i = 0; i < pendingMarks.length; i += MAX_MARK_CONCURRENCY) {
                const chunk = pendingMarks.slice(i, i + MAX_MARK_CONCURRENCY);
                const marks = await Promise.all(chunk.map(id => this.apiClient.markTaskCompleted(accessToken, listId, id)));
                marks.forEach((marked, idx) => {
                    if (marked) {
                        result.markedCompletedCount += 1;
                        processedSet.add(chunk[idx]);
                    }
                });
            }

            await GoogleSyncStateService.setProcessedIds(Array.from(processedSet));
            await GoogleSyncStateService.writeSyncState({ listId, syncToken: delta.nextSyncToken });
            if (delta.nextSyncToken && delta.nextSyncToken !== syncState.syncToken) {
                result.syncTokenUpdated = true;
            }
            await GoogleSyncStateService.setLastSyncAt(new Date());

            return result;
        } catch (error) {
            LoggerService.error({
                service: 'GoogleSyncOrchestrator',
                operation: 'syncToBrainDump',
                message: `Sync failed (attempt ${retryCount + 1})`,
                error,
            });

            if (retryCount < this.MAX_SYNC_RETRIES) {
                await new Promise(r => setTimeout(r, this.BASE_RETRY_DELAY_MS * Math.pow(2, retryCount)));
                return this.syncToBrainDump(retryCount + 1);
            }
            throw error;
        } finally {
            this.isSyncing = false;
        }
    }

    private async listDeltaTasks(accessToken: string, listId: string, syncToken?: string) {
        let pageToken: string | undefined;
        let nextSyncToken = syncToken;
        const allItems: GoogleTaskItem[] = [];
        do {
            const page = await this.apiClient.listTasks(accessToken, listId, { syncToken, pageToken });
            if (Array.isArray(page.items)) allItems.push(...page.items);
            if (page.nextSyncToken) nextSyncToken = page.nextSyncToken;
            pageToken = page.nextPageToken;
        } while (pageToken);
        return { items: allItems, nextSyncToken };
    }

    startForegroundPolling(intervalMs = 15 * 60 * 1000): void {
        if (isWeb || this.pollTimer) return;
        this.pollTimer = setInterval(() => {
            this.syncToBrainDump().catch(error => {
                LoggerService.error({ service: 'GoogleSyncOrchestrator', operation: 'polling', message: 'Poll failed', error });
            });
        }, intervalMs);

        this.netInfoUnsubscribe = NetInfo.addEventListener((state) => {
            if (state.isConnected) {
                this.syncToBrainDump().catch(error => {
                    LoggerService.warn({ service: 'GoogleSyncOrchestrator', operation: 'netInfoSync', message: 'Background sync failed', error });
                });
                this.processOfflineQueue().catch(error => {
                    LoggerService.warn({ service: 'GoogleSyncOrchestrator', operation: 'netInfoQueue', message: 'Offline queue processing failed', error });
                });
            }
        });

        NetInfo.fetch().then(state => {
            if (state.isConnected) this.processOfflineQueue().catch(error => {
                LoggerService.warn({ service: 'GoogleSyncOrchestrator', operation: 'initialFetchQueue', message: 'Initial queue processing failed', error });
            });
        });
    }

    async processOfflineQueue(): Promise<void> {
        if (this.offlineQueue.length === 0 || isWeb) return;
        const items = [...this.offlineQueue];
        this.offlineQueue = [];
        await this.syncSortedItemsToGoogle(items);
    }

    stopForegroundPolling(): void {
        if (this.netInfoUnsubscribe) { this.netInfoUnsubscribe(); this.netInfoUnsubscribe = null; }
        if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null; }
    }
}

export const GoogleSyncOrchestrator = new GoogleSyncOrchestratorClass();

import StorageService from './StorageService';

export interface GoogleTasksSyncState {
    listId?: string;
    syncToken?: string;
}

const MAX_PROCESSED_IDS = 500;
const MAX_EXPORTED_FINGERPRINTS = 1000;

class GoogleSyncStateServiceClass {
    async readSyncState(): Promise<GoogleTasksSyncState> {
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

    async writeSyncState(nextState: GoogleTasksSyncState): Promise<void> {
        await StorageService.setJSON(
            StorageService.STORAGE_KEYS.googleTasksSyncState,
            nextState,
        );
    }

    async getProcessedIds(): Promise<string[]> {
        const value = await StorageService.getJSON<unknown>(
            StorageService.STORAGE_KEYS.googleTasksProcessedIds,
        );
        return this.ensureStringArray(value);
    }

    async setProcessedIds(ids: string[]): Promise<void> {
        const unique = Array.from(new Set(ids)).slice(-MAX_PROCESSED_IDS);
        await StorageService.setJSON(
            StorageService.STORAGE_KEYS.googleTasksProcessedIds,
            unique,
        );
    }

    async getExportedFingerprints(): Promise<string[]> {
        const value = await StorageService.getJSON<unknown>(
            StorageService.STORAGE_KEYS.googleTasksExportedFingerprints,
        );
        return this.ensureStringArray(value);
    }

    async setExportedFingerprints(fingerprints: string[]): Promise<void> {
        const unique = Array.from(new Set(fingerprints)).slice(
            -MAX_EXPORTED_FINGERPRINTS,
        );
        await StorageService.setJSON(
            StorageService.STORAGE_KEYS.googleTasksExportedFingerprints,
            unique,
        );
    }

    async setLastSyncAt(date: Date): Promise<void> {
        await StorageService.set(
            StorageService.STORAGE_KEYS.googleTasksLastSyncAt,
            date.toISOString(),
        );
    }

    private ensureStringArray(value: unknown): string[] {
        if (!Array.isArray(value)) {
            return [];
        }
        return value.filter((item): item is string => typeof item === 'string');
    }
}

export const GoogleSyncStateService = new GoogleSyncStateServiceClass();

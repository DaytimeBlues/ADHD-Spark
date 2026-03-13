import { LoggerService, withOperationContext } from '../LoggerService';
import { GoogleAuthService } from '../GoogleAuthService';
import { googleTasksApiClient } from '../GoogleTasksApiClient';
import { config } from '../../config';
import { isWeb } from '../../utils/PlatformUtils';
import { GOOGLE_CALENDAR_SCOPE, GOOGLE_TASKS_SCOPE } from './constants';
import { createOperationContext } from '../OperationContext';
import { GoogleExportService } from './GoogleExportService';
import { GoogleImportService } from './GoogleImportService';
import { GooglePollingService } from './GooglePollingService';
import type { GoogleExportResult, GoogleTasksSyncResult } from './types';
import type { SortedItem } from '../AISortService';

class GoogleSyncCoordinator {
  private readonly authService = new GoogleAuthService([
    GOOGLE_TASKS_SCOPE,
    GOOGLE_CALENDAR_SCOPE,
  ]);
  private readonly apiClient = googleTasksApiClient;
  private isSyncing = false;
  private offlineQueue: SortedItem[] = [];

  private readonly exportService = new GoogleExportService({
    authService: this.authService,
    apiClient: this.apiClient,
    isWeb,
    queueOfflineItems: (items) => {
      this.offlineQueue.push(...items);
    },
  });

  private readonly importService = new GoogleImportService({
    authService: this.authService,
    apiClient: this.apiClient,
    getIsSyncing: () => this.isSyncing,
    setIsSyncing: (value) => {
      this.isSyncing = value;
    },
  });

  private readonly pollingService = new GooglePollingService({
    isWeb,
    syncToBrainDump: () => this.syncToBrainDump(),
    processOfflineQueue: () => this.processOfflineQueue(),
  });

  private hasGoogleClientIds(): boolean {
    return (
      Boolean(config.googleWebClientId) || Boolean(config.googleIosClientId)
    );
  }

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

  async syncSortedItemsToGoogle(
    items: SortedItem[],
    operationContext = createOperationContext({
      feature: 'google-sync-export',
    }),
  ): Promise<GoogleExportResult> {
    return this.exportService.syncSortedItemsToGoogle(items, operationContext);
  }

  async syncToBrainDump(
    retryCount = 0,
    operationContext = createOperationContext({
      feature: 'google-sync-import',
    }),
  ): Promise<GoogleTasksSyncResult> {
    return this.importService.syncToBrainDump(retryCount, operationContext);
  }

  startForegroundPolling(intervalMs = 15 * 60 * 1000): void {
    if (!this.hasGoogleClientIds()) {
      return;
    }
    this.pollingService.startForegroundPolling(intervalMs);
  }

  stopForegroundPolling(): void {
    this.pollingService.stopForegroundPolling();
  }

  private async processOfflineQueue(
    operationContext = createOperationContext({
      feature: 'google-sync-export',
    }),
  ): Promise<void> {
    if (this.offlineQueue.length === 0 || isWeb) {
      return;
    }

    const items = [...this.offlineQueue];
    this.offlineQueue = [];
    LoggerService.info({
      ...withOperationContext(
        {
          service: 'GoogleTasksSyncService',
          operation: 'processOfflineQueue',
          message: `Processing ${items.length} queued items.`,
        },
        operationContext,
      ),
    });
    await this.exportService.syncSortedItemsToGoogle(items, operationContext);
  }
}

export const GoogleTasksSyncService = new GoogleSyncCoordinator();
export default GoogleTasksSyncService;

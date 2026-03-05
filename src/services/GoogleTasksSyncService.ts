import { SortedItem } from './AISortService';
import {
  GoogleSyncOrchestrator,
  GoogleExportResult,
  GoogleTasksSyncResult,
} from './GoogleSyncOrchestrator';

/**
 * GoogleTasksSyncService
 *
 * Facade service for Google Tasks/Calendar synchronization.
 * Delegates synchronization logic to GoogleSyncOrchestrator and
 * handles high-level service interface.
 */

class GoogleTasksSyncServiceClass {
  /**
   * Configures Google Sign-in with the provided client IDs.
   */
  configureGoogleSignIn(webClientId?: string, iosClientId?: string): void {
    GoogleSyncOrchestrator.getAuthService().configureGoogleSignIn(webClientId, iosClientId);
  }

  /**
   * Retrieves the scopes granted to the current user.
   */
  async getCurrentUserScopes(): Promise<string[] | null> {
    return GoogleSyncOrchestrator.getAuthService().getCurrentUserScopes();
  }

  /**
   * Retrieves the current user's email address.
   */
  async getCurrentUserEmail(): Promise<string | null> {
    return GoogleSyncOrchestrator.getAuthService().getCurrentUserEmail();
  }

  /**
   * Triggers an interactive sign-in flow.
   */
  async signInInteractive(): Promise<boolean> {
    return GoogleSyncOrchestrator.getAuthService().signInInteractive();
  }

  /**
   * Synchronizes sorted items (tasks/events) to Google Tasks/Calendar.
   */
  async syncSortedItemsToGoogle(items: SortedItem[]): Promise<GoogleExportResult> {
    return GoogleSyncOrchestrator.syncSortedItemsToGoogle(items);
  }

  /**
   * Synchronizes Google Tasks back into the local Brain Dump.
   */
  async syncToBrainDump(retryCount = 0): Promise<GoogleTasksSyncResult> {
    return GoogleSyncOrchestrator.syncToBrainDump(retryCount);
  }

  /**
   * Starts periodic polling and network status observers.
   */
  startForegroundPolling(intervalMs = 15 * 60 * 1000): void {
    GoogleSyncOrchestrator.startForegroundPolling(intervalMs);
  }

  /**
   * Processes the offline queue of items waiting to be synced.
   */
  async processOfflineQueue(): Promise<void> {
    return GoogleSyncOrchestrator.processOfflineQueue();
  }

  /**
   * Stops periodic polling and removes observers.
   */
  stopForegroundPolling(): void {
    GoogleSyncOrchestrator.stopForegroundPolling();
  }
}

export const GoogleTasksSyncService = new GoogleTasksSyncServiceClass();
export default GoogleTasksSyncService;
export type { GoogleExportResult, GoogleTasksSyncResult };

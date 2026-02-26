import { SortedItem } from "./AISortService";

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
    | "auth_required"
    | "auth_failed"
    | "network"
    | "rate_limited"
    | "api_error";
  errorMessage?: string;
}

class GoogleTasksSyncServiceClass {
  configureGoogleSignIn(): void {
    return;
  }

  async signInInteractive(): Promise<boolean> {
    return false;
  }

  async getCurrentUserScopes(): Promise<string[] | null> {
    return null;
  }

  async getCurrentUserEmail(): Promise<string | null> {
    return null;
  }

  async syncSortedItemsToGoogle(
    items: SortedItem[],
  ): Promise<GoogleExportResult> {
    return {
      createdTasks: 0,
      createdEvents: 0,
      skippedCount: items.length,
      authRequired: true,
      errorCode: "auth_required",
      errorMessage: "Google sign-in is not available on web yet.",
    };
  }

  async syncToBrainDump(): Promise<GoogleTasksSyncResult> {
    return {
      importedCount: 0,
      skippedCount: 0,
      markedCompletedCount: 0,
      syncTokenUpdated: false,
    };
  }

  startForegroundPolling(): void {
    return;
  }

  stopForegroundPolling(): void {
    return;
  }
}

export const GoogleTasksSyncService = new GoogleTasksSyncServiceClass();
export default GoogleTasksSyncService;

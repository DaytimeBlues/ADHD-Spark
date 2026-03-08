export interface GoogleTasksSyncState {
  listId?: string;
  syncToken?: string;
}

export interface BrainDumpItem {
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

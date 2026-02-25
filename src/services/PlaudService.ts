/**
 * PlaudService (Bridge)
 *
 * This file is kept for backward compatibility after splitting the God class.
 * It re-exports functionality from TranscriptionService and GoogleTasksSyncService.
 * New code should import from the specific services directly.
 */

import TranscriptionService, {
  TranscriptionResult,
} from './TranscriptionService';
import GoogleTasksSyncService, {
  GoogleExportResult,
  GoogleTasksSyncResult,
} from './GoogleTasksSyncService';

// Re-export types
export type { TranscriptionResult, GoogleExportResult, GoogleTasksSyncResult };

// Re-export singleton instances
export { TranscriptionService as PlaudService, GoogleTasksSyncService };

// Default export
export default TranscriptionService;

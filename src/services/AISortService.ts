import { config } from '../config';

export type SortCategory =
  | 'task'
  | 'event'
  | 'reminder'
  | 'thought'
  | 'worry'
  | 'idea';
export type SortPriority = 'high' | 'medium' | 'low';

export interface SortedItem {
  text: string;
  category: SortCategory;
  priority: SortPriority;
  dueDate?: string;
  start?: string;
  end?: string;
}

/** Structured error codes for contextual UI messages. */
export type AiSortErrorCode =
  | 'AI_NETWORK'
  | 'AI_TIMEOUT'
  | 'AI_INVALID_RESPONSE'
  | 'AI_SERVER_ERROR'
  | 'AI_UNKNOWN';

export class AiSortError extends Error {
  constructor(
    public readonly code: AiSortErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AiSortError';
  }
}

interface SortResponse {
  sorted: SortedItem[];
}

// ─── Cache ────────────────────────────────────────────────────────────────────

interface CacheEntry {
  result: SortedItem[];
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const sortCache = new Map<string, CacheEntry>();

function cacheKey(items: string[], timezone?: string): string {
  return JSON.stringify({ items, timezone });
}

function getCached(key: string): SortedItem[] | null {
  const entry = sortCache.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    sortCache.delete(key);
    return null;
  }
  return entry.result;
}

const MAX_CACHE_SIZE = 50;

function setCache(key: string, result: SortedItem[]): void {
  if (sortCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = sortCache.keys().next().value;
    if (oldestKey !== undefined) {
      sortCache.delete(oldestKey);
    }
  }
  sortCache.set(key, { result, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ─── Validation ───────────────────────────────────────────────────────────────

const ALLOWED_CATEGORIES: SortCategory[] = [
  'task',
  'event',
  'reminder',
  'thought',
  'worry',
  'idea',
];
const ALLOWED_PRIORITIES: SortPriority[] = ['high', 'medium', 'low'];

function isSortedItem(value: unknown): value is SortedItem {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const c = value as Record<string, unknown>;
  return (
    typeof c.text === 'string' &&
    ALLOWED_CATEGORIES.includes(c.category as SortCategory) &&
    ALLOWED_PRIORITIES.includes(c.priority as SortPriority)
  );
}

function assertSortResponse(value: unknown): SortResponse {
  if (!value || typeof value !== 'object') {
    throw new AiSortError(
      'AI_INVALID_RESPONSE',
      'Invalid AI sort response payload.',
    );
  }
  const r = value as Record<string, unknown>;
  if (!Array.isArray(r.sorted) || !r.sorted.every(isSortedItem)) {
    throw new AiSortError(
      'AI_INVALID_RESPONSE',
      'Invalid AI sort response schema.',
    );
  }
  return { sorted: r.sorted };
}

// ─── Error classification ─────────────────────────────────────────────────────

function classifyError(error: unknown): AiSortError {
  if (error instanceof AiSortError) {
    return error;
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (error.name === 'AbortError') {
      return new AiSortError(
        'AI_TIMEOUT',
        'AI sort timed out. Please try again.',
      );
    }
    if (
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('err_failed') ||
      msg.includes('load failed') ||
      msg.includes('cors')
    ) {
      return new AiSortError(
        'AI_NETWORK',
        'AI sort is unavailable in this browser session (network/CORS restriction). Items remain saved locally.',
      );
    }
  }

  return new AiSortError('AI_UNKNOWN', 'Unable to sort items right now.');
}

// ─── Retry helper ─────────────────────────────────────────────────────────────

async function fetchWithRetry(
  items: string[],
  timezone: string | undefined,
  maxRetries: number = 0,
  timeoutMs: number = 8000,
): Promise<SortedItem[]> {
  let lastError: AiSortError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/sort`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, timezone }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        if (!response.ok) {
          throw new AiSortError(
            'AI_SERVER_ERROR',
            'Unable to sort items right now.',
          );
        }
        throw new AiSortError(
          'AI_INVALID_RESPONSE',
          'Invalid AI sort response payload.',
        );
      }

      if (!response.ok) {
        const serverMsg =
          payload &&
          typeof payload === 'object' &&
          typeof (payload as { error?: unknown }).error === 'string'
            ? (payload as { error: string }).error
            : 'Unable to sort items right now.';
        throw new AiSortError('AI_SERVER_ERROR', serverMsg);
      }

      return assertSortResponse(payload).sorted;
    } catch (err) {
      clearTimeout(timer);
      lastError = classifyError(err);

      // Do not retry network or timeout errors — they're systemic
      if (lastError.code === 'AI_NETWORK' || lastError.code === 'AI_TIMEOUT') {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      }
    }
  }

  throw (
    lastError ??
    new AiSortError('AI_UNKNOWN', 'Unable to sort items right now.')
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

const AISortService = {
  async sortItems(items: string[], timezone?: string): Promise<SortedItem[]> {
    const cleanedItems = items
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 100);

    if (cleanedItems.length === 0) {
      return [];
    }

    const key = cacheKey(cleanedItems, timezone);
    const cached = getCached(key);
    if (cached) {
      return cached;
    }

    const result = await fetchWithRetry(
      cleanedItems,
      timezone,
      config.aiMaxRetries,
      config.aiTimeout,
    );

    setCache(key, result);
    return result;
  },

  /** Clear the in-memory sort cache (useful for testing or forced refresh). */
  clearCache(): void {
    sortCache.clear();
  },
};

export default AISortService;

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

interface SortResponse {
  sorted: SortedItem[];
}

const NETWORK_RESTRICTION_ERROR =
  'AI sort is unavailable in this browser session (network/CORS restriction). Items remain saved locally.';
const GENERIC_SORT_ERROR = 'Unable to sort items right now.';

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

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.text === 'string' &&
    ALLOWED_CATEGORIES.includes(candidate.category as SortCategory) &&
    ALLOWED_PRIORITIES.includes(candidate.priority as SortPriority)
  );
}

function assertSortResponse(value: unknown): SortResponse {
  if (!value || typeof value !== 'object') {
    throw new Error('Invalid AI sort response payload.');
  }

  const response = value as Record<string, unknown>;
  if (!Array.isArray(response.sorted) || !response.sorted.every(isSortedItem)) {
    throw new Error('Invalid AI sort response schema.');
  }

  return {
    sorted: response.sorted,
  };
}

function isLikelyNetworkOrCorsError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('err_failed') ||
    message.includes('load failed') ||
    message.includes('cors')
  );
}

const AISortService = {
  async sortItems(items: string[], timezone?: string): Promise<SortedItem[]> {
    const cleanedItems = items
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 100);

    if (cleanedItems.length === 0) {
      return [];
    }

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/sort`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cleanedItems,
          timezone,
        }),
      });

      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        if (!response.ok) {
          throw new Error(GENERIC_SORT_ERROR);
        }
        throw new Error('Invalid AI sort response payload.');
      }

      if (!response.ok) {
        const message =
          payload &&
          typeof payload === 'object' &&
          typeof (payload as { error?: unknown }).error === 'string'
            ? (payload as { error: string }).error
            : GENERIC_SORT_ERROR;
        throw new Error(message);
      }

      return assertSortResponse(payload).sorted;
    } catch (error) {
      if (isLikelyNetworkOrCorsError(error)) {
        throw new Error(NETWORK_RESTRICTION_ERROR);
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error(GENERIC_SORT_ERROR);
    }
  },
};

export default AISortService;

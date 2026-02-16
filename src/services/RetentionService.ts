import StorageService from './StorageService';

export type ReentryPromptLevel = 'none' | 'gentle_restart' | 'fresh_restart';

const GRACE_DAYS_PER_WINDOW = 1;
const GRACE_WINDOW_DAYS = 7;

const getDateOnly = (isoDate: string): string => {
  return isoDate.slice(0, 10);
};

const dayDifference = (fromISO: string, toISO: string): number => {
  const from = new Date(fromISO + 'T00:00:00Z').getTime();
  const to = new Date(toISO + 'T00:00:00Z').getTime();
  return Math.floor((to - from) / (24 * 60 * 60 * 1000));
};

const parsePositiveInt = (raw: string | null, fallback: number): number => {
  const parsed = Number.parseInt(raw ?? '', 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
};

const RetentionService = {
  async markAppUse(now: Date = new Date()): Promise<number> {
    const today = getDateOnly(now.toISOString());
    const [lastUseDate, streakRaw, graceWindowStart, graceDaysUsedRaw] =
      await Promise.all([
      StorageService.get(StorageService.STORAGE_KEYS.lastUseDate),
      StorageService.get(StorageService.STORAGE_KEYS.streakCount),
      StorageService.get(StorageService.STORAGE_KEYS.retentionGraceWindowStart),
      StorageService.get(StorageService.STORAGE_KEYS.retentionGraceDaysUsed),
    ]);

    const currentStreak = Number.parseInt(streakRaw ?? '0', 10) || 0;
    const activeWindowStart =
      graceWindowStart &&
      dayDifference(graceWindowStart, today) >= 0 &&
      dayDifference(graceWindowStart, today) < GRACE_WINDOW_DAYS
        ? graceWindowStart
        : today;
    const graceDaysUsed =
      activeWindowStart === graceWindowStart
        ? parsePositiveInt(graceDaysUsedRaw, 0)
        : 0;

    if (!lastUseDate) {
      if (typeof StorageService.set === 'function') {
        await Promise.all([
          StorageService.set(StorageService.STORAGE_KEYS.lastUseDate, today),
          StorageService.set(StorageService.STORAGE_KEYS.streakCount, '1'),
          StorageService.set(
            StorageService.STORAGE_KEYS.retentionGraceWindowStart,
            activeWindowStart,
          ),
          StorageService.set(
            StorageService.STORAGE_KEYS.retentionGraceDaysUsed,
            graceDaysUsed.toString(),
          ),
        ]);
      }
      return 1;
    }

    const diff = dayDifference(lastUseDate, today);

    if (diff <= 0) {
      return currentStreak > 0 ? currentStreak : 1;
    }

    const canUseGraceDay =
      diff === 2 && graceDaysUsed < GRACE_DAYS_PER_WINDOW && currentStreak > 0;
    const nextStreak =
      diff === 1 || canUseGraceDay ? Math.max(1, currentStreak + 1) : 1;
    const nextGraceDaysUsed = canUseGraceDay ? graceDaysUsed + 1 : graceDaysUsed;

    if (typeof StorageService.set === 'function') {
      await Promise.all([
        StorageService.set(StorageService.STORAGE_KEYS.lastUseDate, today),
        StorageService.set(
          StorageService.STORAGE_KEYS.streakCount,
          nextStreak.toString(),
        ),
        StorageService.set(
          StorageService.STORAGE_KEYS.retentionGraceWindowStart,
          activeWindowStart,
        ),
        StorageService.set(
          StorageService.STORAGE_KEYS.retentionGraceDaysUsed,
          nextGraceDaysUsed.toString(),
        ),
      ]);
    }

    return nextStreak;
  },

  async getReentryPromptLevel(now: Date = new Date()): Promise<ReentryPromptLevel> {
    const lastUseDate = await StorageService.get(
      StorageService.STORAGE_KEYS.lastUseDate,
    );

    if (!lastUseDate) {
      return 'none';
    }

    const today = getDateOnly(now.toISOString());
    const diff = dayDifference(lastUseDate, today);

    if (diff <= 1) {
      return 'none';
    }

    if (diff <= 3) {
      return 'gentle_restart';
    }

    return 'fresh_restart';
  },
};

export default RetentionService;

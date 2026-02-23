import AsyncStorage from '@react-native-async-storage/async-storage';
import { open } from '@op-engineering/op-sqlite';

const db = open({
  name: 'spark_db',
});

const STORAGE_VERSION = 1;
const STORAGE_VERSION_KEY = 'storageVersion';

const STORAGE_KEYS = {
  streakCount: 'streakCount',
  lastUseDate: 'lastUseDate',
  theme: 'theme',
  tasks: 'tasks',
  brainDump: 'brainDump',
  igniteState: 'igniteState',
  pomodoroState: 'pomodoroState',
  firstSuccessGuideState: 'firstSuccessGuideState',
  uxMetricsEvents: 'uxMetricsEvents',
  activationSessions: 'activationSessions',
  activationPendingStart: 'activationPendingStart',
  lastActiveSession: 'lastActiveSession',
  retentionGraceWindowStart: 'retentionGraceWindowStart',
  retentionGraceDaysUsed: 'retentionGraceDaysUsed',
  googleTasksSyncState: 'googleTasksSyncState',
  googleTasksProcessedIds: 'googleTasksProcessedIds',
  googleTasksLastSyncAt: 'googleTasksLastSyncAt',
  googleTasksExportedFingerprints: 'googleTasksExportedFingerprints',
  backupLastExportAt: 'backupLastExportAt',
  captureInbox: 'captureInbox',
  isBiometricSecured: 'isBiometricSecured',
};

const migrations: Record<number, () => Promise<void>> = {};

const runMigrations = async (): Promise<void> => {
  try {
    const storedVersion = await StorageService.get(STORAGE_VERSION_KEY);
    const currentVersion = storedVersion ? parseInt(storedVersion, 10) : 0;

    if (currentVersion < STORAGE_VERSION) {
      for (let v = currentVersion + 1; v <= STORAGE_VERSION; v++) {
        if (migrations[v]) {
          await migrations[v]();
        }
      }

      await StorageService.set(
        STORAGE_VERSION_KEY,
        STORAGE_VERSION.toString(),
      );
    }
  } catch (error) {
    console.error('Storage migration error:', error);
  }
};

const StorageService = {
  async init(): Promise<void> {
    await db.execute('CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value TEXT)');

    // Auto-migrate from AsyncStorage to op-sqlite
    const isMigrated = await AsyncStorage.getItem('SQLITE_MIGRATED');
    if (!isMigrated) {
      try {
        const keys = await AsyncStorage.getAllKeys();
        if (keys.length > 0) {
          const pairs = await AsyncStorage.multiGet(keys);

          await db.transaction(async (tx) => {
            for (const [key, value] of pairs) {
              if (value) {
                await tx.execute('INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)', [key, value]);
              }
            }
          });
        }
        await AsyncStorage.setItem('SQLITE_MIGRATED', 'true');
      } catch (e) {
        console.error('Migration to SQLite failed:', e);
      }
    }

    await runMigrations();
  },

  async get(key: string): Promise<string | null> {
    try {
      const res = await db.execute('SELECT value FROM kv_store WHERE key = ?', [key]);
      if (res.rows?.length) {
        return res.rows[0].value as string;
      }
      return null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  async set(key: string, value: string): Promise<boolean> {
    try {
      await db.execute('INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)', [key, value]);
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },

  async remove(key: string): Promise<boolean> {
    try {
      await db.execute('DELETE FROM kv_store WHERE key = ?', [key]);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },

  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const value = await this.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Storage getJSON error:', error);
      return null;
    }
  },

  async setJSON<T>(key: string, value: T): Promise<boolean> {
    try {
      return await this.set(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage setJSON error:', error);
      return false;
    }
  },

  STORAGE_KEYS,
};

export const zustandStorage = {
  getItem: (name: string): Promise<string | null> => {
    return StorageService.get(name);
  },
  setItem: (name: string, value: string): Promise<void> => {
    return StorageService.set(name, value).then(() => { });
  },
  removeItem: (name: string): Promise<void> => {
    return StorageService.remove(name).then(() => { });
  },
};

export default StorageService;

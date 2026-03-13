import AsyncStorage from '@react-native-async-storage/async-storage';
import { isWeb } from '../utils/PlatformUtils';
import type {
  DB,
  QueryResult,
  Scalar,
  Transaction,
} from '@op-engineering/op-sqlite';
import { LoggerService } from './LoggerService';

type KVDatabase = Pick<DB, 'execute' | 'transaction'>;
type KVQueryResult = QueryResult & { rows: Array<Record<string, Scalar>> };

let db: KVDatabase | undefined;
const isJestRuntime =
  typeof process !== 'undefined' && !!process.env.JEST_WORKER_ID;
let initPromise: Promise<void> | null = null;
let isInitialized = false;

if (!isWeb && !isJestRuntime) {
  const { open } = require('@op-engineering/op-sqlite');
  db = open({
    name: 'spark_db',
  });
}

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
  checkInHistory: 'checkInHistory',
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

const migrations: Record<number, () => Promise<void>> = {
  1: async () => {
    return;
  },
};

const runMigrations = async (): Promise<void> => {
  try {
    const storedVersion = await StorageService.get(STORAGE_VERSION_KEY);
    const currentVersion = storedVersion ? parseInt(storedVersion, 10) : 0;

    if (currentVersion < STORAGE_VERSION) {
      for (let v = currentVersion + 1; v <= STORAGE_VERSION; v++) {
        await migrations[v]?.();
      }

      await StorageService.set(STORAGE_VERSION_KEY, STORAGE_VERSION.toString());
    }
  } catch (error) {
    LoggerService.error({
      service: 'StorageService',
      operation: 'runMigrations',
      message: 'Storage migration error',
      error,
    });
  }
};

/**
 * Safely parse JSON with error handling for corrupted data.
 * Returns null if parsing fails or data is invalid.
 */
const safeJSONParse = <T>(value: string | null): T | null => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    LoggerService.warn({
      service: 'StorageService',
      operation: 'safeJSONParse',
      message: 'Failed to parse JSON, returning null',
      error,
    });
    return null;
  }
};

const getDb = (): KVDatabase => {
  if (!db) {
    throw new Error('SQLite database is not initialized');
  }
  return db;
};

const performInit = async (): Promise<void> => {
  if (isWeb || isJestRuntime) {
    isInitialized = true;
    await runMigrations();
    return;
  }

  await getDb().execute(
    'CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value TEXT)',
  );

  const isMigrated = await AsyncStorage.getItem('SQLITE_MIGRATED');
  if (!isMigrated) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      if (keys.length > 0) {
        const pairs = await AsyncStorage.multiGet(keys);

        await getDb().transaction(async (tx: Transaction) => {
          for (const [key, value] of pairs) {
            if (value) {
              await tx.execute(
                'INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)',
                [key, value],
              );
            }
          }
        });
      }
      await AsyncStorage.setItem('SQLITE_MIGRATED', 'true');
    } catch (e) {
      LoggerService.error({
        service: 'StorageService',
        operation: 'init',
        message: 'Migration to SQLite failed',
        error: e,
      });
    }
  }

  isInitialized = true;
  await runMigrations();
};

const ensureInitialized = async (): Promise<void> => {
  if (isInitialized) {
    return;
  }

  if (!initPromise) {
    initPromise = performInit().finally(() => {
      initPromise = null;
    });
  }

  await initPromise;
};

const StorageService = {
  async init(): Promise<void> {
    await ensureInitialized();
  },

  async get(key: string): Promise<string | null> {
    if (isWeb || isJestRuntime) {
      try {
        return await AsyncStorage.getItem(key);
      } catch (error) {
        LoggerService.error({
          service: 'StorageService',
          operation: 'get',
          message: 'Storage get error (AsyncStorage)',
          error,
          context: { key },
        });
        return null;
      }
    }

    try {
      await ensureInitialized();
      const res = (await getDb().execute(
        'SELECT value FROM kv_store WHERE key = ?',
        [key],
      )) as KVQueryResult;
      if (res.rows?.length) {
        const rowValue = res.rows[0]?.value;
        return typeof rowValue === 'string' ? rowValue : null;
      }
      return null;
    } catch (error) {
      LoggerService.error({
        service: 'StorageService',
        operation: 'get',
        message: 'Storage get error (SQLite)',
        error,
        context: { key },
      });
      return null;
    }
  },

  async set(
    key: string,
    value: string,
  ): Promise<{ success: boolean; error?: unknown }> {
    if (isWeb || isJestRuntime) {
      try {
        await AsyncStorage.setItem(key, value);
        return { success: true };
      } catch (e) {
        LoggerService.error({
          service: 'StorageService',
          operation: 'set',
          message: 'Storage set error (AsyncStorage)',
          error: e,
          context: { key },
        });
        return { success: false, error: e };
      }
    }

    try {
      await ensureInitialized();
      await getDb().execute(
        'INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)',
        [key, value],
      );
      return { success: true };
    } catch (error) {
      LoggerService.error({
        service: 'StorageService',
        operation: 'set',
        message: 'Storage set error (SQLite)',
        error,
        context: { key },
      });
      return { success: false, error };
    }
  },

  async remove(key: string): Promise<{ success: boolean; error?: unknown }> {
    if (isWeb || isJestRuntime) {
      try {
        await AsyncStorage.removeItem(key);
        return { success: true };
      } catch (e) {
        LoggerService.error({
          service: 'StorageService',
          operation: 'remove',
          message: 'Storage remove error (AsyncStorage)',
          error: e,
          context: { key },
        });
        return { success: false, error: e };
      }
    }

    try {
      await ensureInitialized();
      await getDb().execute('DELETE FROM kv_store WHERE key = ?', [key]);
      return { success: true };
    } catch (error) {
      LoggerService.error({
        service: 'StorageService',
        operation: 'remove',
        message: 'Storage remove error (SQLite)',
        error,
        context: { key },
      });
      return { success: false, error };
    }
  },

  /**
   * Safely retrieve and parse JSON from storage.
   * Returns null if the key doesn't exist or if parsing fails.
   */
  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const value = await this.get(key);
      return safeJSONParse<T>(value);
    } catch (error) {
      LoggerService.error({
        service: 'StorageService',
        operation: 'getJSON',
        message: 'Storage getJSON error',
        error,
        context: { key },
      });
      return null;
    }
  },

  async setJSON<T>(key: string, value: T): Promise<boolean> {
    try {
      const result = await this.set(key, JSON.stringify(value));
      return result.success;
    } catch (error) {
      LoggerService.error({
        service: 'StorageService',
        operation: 'setJSON',
        message: 'Storage setJSON error',
        error,
        context: { key },
      });
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
    return StorageService.set(name, value).then((result) => {
      if (!result.success) {
        throw result.error || new Error(`Failed to set item: ${name}`);
      }
    });
  },
  removeItem: (name: string): Promise<void> => {
    return StorageService.remove(name).then((result) => {
      if (!result.success) {
        throw result.error || new Error(`Failed to remove item: ${name}`);
      }
    });
  },
};

export default StorageService;

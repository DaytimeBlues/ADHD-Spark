import { useCallback, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Alert, NativeModules, Share } from 'react-native';
import StorageService from '../../../services/StorageService';
import {
  LoggerService,
  withOperationContext,
} from '../../../services/LoggerService';
import { createOperationContext } from '../../../services/OperationContext';
import { isWeb } from '../../../utils/PlatformUtils';
import type { BackupImportMode, BackupPayload } from '../types';

const BACKUP_SCHEMA = 'spark-backup-v1' as const;
const BACKUP_APP_ID = 'spark-adhd' as const;

type ParseBackupResult = { payload: BackupPayload } | { error: string };

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export type UseBackupManagerOptions = {
  onImported?: () => Promise<void> | void;
};

export type UseBackupManagerResult = {
  backupJson: string;
  setBackupJson: (value: string) => void;
  isBackupBusy: boolean;
  backupStatus: string;
  importMode: BackupImportMode;
  setImportMode: (mode: BackupImportMode) => void;
  lastBackupExportAt: string | null;
  exportBackup: () => Promise<void>;
  importBackup: () => Promise<void>;
  refreshLastBackupExportAt: () => Promise<void>;
};

export const useBackupManager = (
  options: UseBackupManagerOptions = {},
): UseBackupManagerResult => {
  const [backupJson, setBackupJson] = useState('');
  const [isBackupBusy, setIsBackupBusy] = useState(false);
  const [backupStatus, setBackupStatus] = useState('');
  const [importMode, setImportMode] = useState<BackupImportMode>('overwrite');
  const [lastBackupExportAt, setLastBackupExportAt] = useState<string | null>(
    null,
  );
  const { onImported } = options;

  const exportableKeys = useMemo(
    () => Object.values(StorageService.STORAGE_KEYS),
    [],
  );

  const announceBackupStatus = useCallback((message: string) => {
    setBackupStatus(message);
    AccessibilityInfo.announceForAccessibility?.(message);
  }, []);

  const parseBackupPayload = useCallback(
    (value: unknown): ParseBackupResult => {
      if (!isRecord(value)) {
        return { error: 'Backup JSON must be an object.' };
      }

      const payload = value as Partial<BackupPayload> & {
        data?: Record<string, unknown>;
      };

      if (payload.schema !== BACKUP_SCHEMA) {
        return { error: 'Unsupported backup schema.' };
      }

      if (payload.app !== BACKUP_APP_ID) {
        return { error: 'Backup is not from Spark ADHD.' };
      }

      if (
        typeof payload.exportedAt !== 'string' ||
        Number.isNaN(Date.parse(payload.exportedAt))
      ) {
        return { error: 'Backup exportedAt timestamp is invalid.' };
      }

      if (!isRecord(payload.data)) {
        return { error: 'Backup data payload is missing.' };
      }

      const hasUnknownKeys = Object.keys(payload.data).some(
        (key) => !exportableKeys.includes(key),
      );
      if (hasUnknownKeys) {
        return { error: 'Backup data includes unsupported keys.' };
      }

      const hasInvalidValues = Object.values(payload.data).some((entry) => {
        return entry !== null && typeof entry !== 'string';
      });
      if (hasInvalidValues) {
        return { error: 'Backup data values must be string or null.' };
      }

      return { payload: payload as BackupPayload };
    },
    [exportableKeys],
  );

  const refreshLastBackupExportAt = useCallback(async () => {
    const value = await StorageService.get(
      StorageService.STORAGE_KEYS.backupLastExportAt,
    );
    setLastBackupExportAt(value);
  }, []);

  const applyImportedBackup = useCallback(
    async (payload: BackupPayload) => {
      const operationContext = createOperationContext({ feature: 'backup' });
      setIsBackupBusy(true);
      try {
        if (importMode === 'overwrite') {
          await Promise.all(
            exportableKeys.map(async (key) => {
              const value = payload.data[key];
              if (typeof value === 'string') {
                await StorageService.set(key, value);
                return;
              }

              await StorageService.remove(key);
            }),
          );
        } else {
          await Promise.all(
            Object.entries(payload.data).map(async ([key, value]) => {
              if (exportableKeys.includes(key) && typeof value === 'string') {
                await StorageService.set(key, value);
              }
            }),
          );
        }

        announceBackupStatus(
          `Import (${importMode}) completed. Diagnostics reloading...`,
        );

        if (onImported) {
          await onImported();
        }
        LoggerService.info({
          ...withOperationContext(
            {
              service: 'useBackupManager',
              operation: 'applyImportedBackup',
              message: 'Backup import completed',
              context: {
                importMode,
                keyCount: Object.keys(payload.data).length,
              },
            },
            operationContext,
          ),
        });
      } catch (error) {
        LoggerService.warn({
          ...withOperationContext(
            {
              service: 'useBackupManager',
              operation: 'applyImportedBackup',
              message: 'Backup import failed',
              error,
              context: { importMode },
            },
            operationContext,
          ),
        });
        announceBackupStatus(
          error instanceof Error
            ? error.message
            : 'Import failed unexpectedly.',
        );
      } finally {
        setIsBackupBusy(false);
      }
    },
    [announceBackupStatus, exportableKeys, importMode, onImported],
  );

  const exportBackup = useCallback(async () => {
    const operationContext = createOperationContext({ feature: 'backup' });
    setIsBackupBusy(true);
    try {
      const entries = await Promise.all(
        exportableKeys.map(async (key) => {
          const value = await StorageService.get(key);
          return [key, value] as const;
        }),
      );

      const payload: BackupPayload = {
        schema: BACKUP_SCHEMA,
        exportedAt: new Date().toISOString(),
        app: BACKUP_APP_ID,
        data: Object.fromEntries(entries),
      };

      const json = JSON.stringify(payload, null, 2);
      setBackupJson(json);
      await StorageService.set(
        StorageService.STORAGE_KEYS.backupLastExportAt,
        payload.exportedAt,
      );
      setLastBackupExportAt(payload.exportedAt);

      const clipboardModule = NativeModules.Clipboard as
        | { setString?: (value: string) => void }
        | undefined;

      if (clipboardModule?.setString) {
        clipboardModule.setString(json);
        announceBackupStatus('Backup exported and copied to clipboard.');
      } else {
        await Share.share({
          title: 'Spark backup JSON',
          message: json,
        });
        announceBackupStatus('Backup exported. Shared via system dialog.');
      }
      LoggerService.info({
        ...withOperationContext(
          {
            service: 'useBackupManager',
            operation: 'exportBackup',
            message: 'Backup export completed',
            context: {
              keyCount: entries.length,
              exportedAt: payload.exportedAt,
            },
          },
          operationContext,
        ),
      });
    } catch (error) {
      LoggerService.warn({
        ...withOperationContext(
          {
            service: 'useBackupManager',
            operation: 'exportBackup',
            message: 'Backup export failed',
            error,
          },
          operationContext,
        ),
      });
      announceBackupStatus(
        error instanceof Error ? error.message : 'Export failed unexpectedly.',
      );
    } finally {
      setIsBackupBusy(false);
    }
  }, [announceBackupStatus, exportableKeys]);

  const importBackup = useCallback(async () => {
    try {
      if (!backupJson.trim()) {
        announceBackupStatus('Paste backup JSON before importing.');
        return;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(backupJson);
      } catch {
        announceBackupStatus('Invalid JSON. Import canceled.');
        return;
      }

      const parsedPayloadResult = parseBackupPayload(parsed);
      if ('error' in parsedPayloadResult) {
        announceBackupStatus(`${parsedPayloadResult.error} Import canceled.`);
        return;
      }

      if (isWeb) {
        await applyImportedBackup(parsedPayloadResult.payload);
        return;
      }

      Alert.alert(
        'Import backup?',
        importMode === 'overwrite'
          ? 'This overwrites local app data for tracked keys. Continue?'
          : 'This merges backup data into local app data. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Import',
            style: 'destructive',
            onPress: () => {
              applyImportedBackup(parsedPayloadResult.payload).catch(
                (error) => {
                  announceBackupStatus(
                    error instanceof Error
                      ? error.message
                      : 'Import failed unexpectedly.',
                  );
                },
              );
            },
          },
        ],
        { cancelable: true },
      );
    } catch (error) {
      announceBackupStatus(
        error instanceof Error ? error.message : 'Import failed unexpectedly.',
      );
    }
  }, [
    announceBackupStatus,
    applyImportedBackup,
    backupJson,
    importMode,
    parseBackupPayload,
  ]);

  useEffect(() => {
    refreshLastBackupExportAt().catch(() => {
      announceBackupStatus('Unable to read last backup export time.');
    });
  }, [announceBackupStatus, refreshLastBackupExportAt]);

  return {
    backupJson,
    setBackupJson,
    isBackupBusy,
    backupStatus,
    importMode,
    setImportMode,
    lastBackupExportAt,
    exportBackup,
    importBackup,
    refreshLastBackupExportAt,
  };
};

export default useBackupManager;

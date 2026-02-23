import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  AccessibilityInfo,
  NativeModules,
  Share,
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Tokens, THEME_METADATA } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';
import { config } from '../config';
import StorageService from '../services/StorageService';
import { CosmicBackground, GlowCard } from '../ui/cosmic';

interface DiagnosticEntry {
  label: string;
  value: string;
  status: 'ok' | 'warning' | 'error' | 'info';
}

type BackupPayload = {
  schema: 'spark-backup-v1';
  exportedAt: string;
  app: 'spark-adhd';
  data: Record<string, string | null>;
};

const BACKUP_SCHEMA = 'spark-backup-v1' as const;
const BACKUP_APP_ID = 'spark-adhd' as const;

type NavigationNode = {
  goBack: () => void;
};

const DiagnosticsScreen = ({ navigation }: { navigation: NavigationNode }) => {
  const { variant, setVariant } = useTheme();
  const [diagnostics, setDiagnostics] = useState<DiagnosticEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [backupJson, setBackupJson] = useState('');
  const [isBackupBusy, setIsBackupBusy] = useState(false);
  const [backupStatus, setBackupStatus] = useState('');
  const [importMode, setImportMode] = useState<'overwrite' | 'merge'>(
    'overwrite',
  );
  const [lastBackupExportAt, setLastBackupExportAt] = useState<string | null>(
    null,
  );

  const exportableKeys = Object.values(StorageService.STORAGE_KEYS);

  const announceBackupStatus = (message: string) => {
    setBackupStatus(message);
    AccessibilityInfo.announceForAccessibility(message);
  };

  const parseBackupPayload = (
    value: unknown,
  ): { payload: BackupPayload } | { error: string } => {
    if (!value || typeof value !== 'object') {
      return { error: 'Backup JSON must be an object.' };
    }

    const payload = value as Partial<BackupPayload>;
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

    if (!payload.data || typeof payload.data !== 'object') {
      return { error: 'Backup data payload is missing.' };
    }

    const hasUnknownKeys = Object.keys(payload.data).some(
      (key) => !exportableKeys.includes(key),
    );
    if (hasUnknownKeys) {
      return { error: 'Backup data includes unsupported keys.' };
    }

    const hasInvalidValue = Object.values(payload.data).some((entry) => {
      return entry !== null && typeof entry !== 'string';
    });
    if (hasInvalidValue) {
      return { error: 'Backup data values must be string or null.' };
    }

    return { payload: payload as BackupPayload };
  };

  const loadLastBackupExportAt = useCallback(async () => {
    const value = await StorageService.get(
      StorageService.STORAGE_KEYS.backupLastExportAt,
    );
    setLastBackupExportAt(value);
  }, []);

  const applyImportedBackup = async (payload: BackupPayload) => {
    setIsBackupBusy(true);
    try {
      if (importMode === 'overwrite') {
        await Promise.all(
          exportableKeys.map(async (key) => {
            const value = payload.data[key];
            if (typeof value === 'string') {
              await StorageService.set(key, value);
            } else {
              await StorageService.remove(key);
            }
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
      await loadDiagnostics();
    } catch (error) {
      announceBackupStatus(
        error instanceof Error ? error.message : 'Import failed unexpectedly.',
      );
    } finally {
      setIsBackupBusy(false);
    }
  };

  const handleExportBackup = async () => {
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
    } catch (error) {
      announceBackupStatus(
        error instanceof Error ? error.message : 'Export failed unexpectedly.',
      );
    } finally {
      setIsBackupBusy(false);
    }
  };

  const handleImportBackup = async () => {
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

    if (Platform.OS === 'web') {
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
            applyImportedBackup(parsedPayloadResult.payload).catch((error) => {
              announceBackupStatus(
                error instanceof Error
                  ? error.message
                  : 'Import failed unexpectedly.',
              );
            });
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleImportBackupPress = () => {
    handleImportBackup().catch((error) => {
      announceBackupStatus(
        error instanceof Error ? error.message : 'Import failed unexpectedly.',
      );
    });
  };

  const loadDiagnostics = useCallback(async () => {
    setIsRefreshing(true);
    const entries: DiagnosticEntry[] = [];
    await loadLastBackupExportAt();

    // Platform check
    entries.push({
      label: 'Platform',
      value: Platform.OS,
      status: 'info',
    });

    // Google config check
    const hasWebClientId = Boolean(config.googleWebClientId);
    const hasIosClientId = Boolean(config.googleIosClientId);
    const hasAnyConfig = hasWebClientId || hasIosClientId;

    entries.push({
      label: 'Google Web Client ID',
      value: hasWebClientId ? 'Configured' : 'Missing',
      status: hasWebClientId ? 'ok' : 'warning',
    });

    entries.push({
      label: 'Google iOS Client ID',
      value: hasIosClientId ? 'Configured' : 'Missing',
      status: hasIosClientId ? 'ok' : 'warning',
    });

    // Auth status
    if (Platform.OS !== 'web') {
      try {
        const canAttemptAuth = hasAnyConfig;
        entries.push({
          label: 'Can Attempt Auth',
          value: canAttemptAuth ? 'Yes' : 'No (missing client IDs)',
          status: canAttemptAuth ? 'ok' : 'error',
        });

        // Try to get scopes (requires native module)
        try {
          const googleModule = require('@react-native-google-signin/google-signin');
          if (googleModule?.GoogleSignin) {
            try {
              const user = await googleModule.GoogleSignin.getCurrentUser();
              if (user?.scopes) {
                const hasTasksScope = user.scopes.includes(
                  'https://www.googleapis.com/auth/tasks',
                );
                const hasCalendarScope = user.scopes.includes(
                  'https://www.googleapis.com/auth/calendar.events',
                );

                entries.push({
                  label: 'Google Tasks Scope',
                  value: hasTasksScope ? 'Granted' : 'Not granted',
                  status: hasTasksScope ? 'ok' : 'warning',
                });

                entries.push({
                  label: 'Google Calendar Scope',
                  value: hasCalendarScope ? 'Granted' : 'Not granted',
                  status: hasCalendarScope ? 'ok' : 'warning',
                });

                entries.push({
                  label: 'Signed In User',
                  value: user.user?.email || 'Unknown',
                  status: 'info',
                });
              } else {
                entries.push({
                  label: 'Google Auth Status',
                  value: 'Not signed in',
                  status: 'warning',
                });
              }
            } catch (error) {
              entries.push({
                label: 'Google Auth Status',
                value: 'Not signed in',
                status: 'warning',
              });
            }
          } else {
            entries.push({
              label: 'Google Sign-In Module',
              value: 'Not available',
              status: 'error',
            });
          }
        } catch {
          entries.push({
            label: 'Google Sign-In Module',
            value: 'Not installed',
            status: 'error',
          });
        }
      } catch (error) {
        entries.push({
          label: 'Auth Check Error',
          value: error instanceof Error ? error.message : 'Unknown error',
          status: 'error',
        });
      }
    } else {
      entries.push({
        label: 'Google Sync',
        value: 'Not available on web',
        status: 'info',
      });
    }

    // Last sync timestamp
    try {
      const lastSyncAt = await StorageService.get(
        StorageService.STORAGE_KEYS.googleTasksLastSyncAt,
      );
      if (lastSyncAt) {
        const date = new Date(lastSyncAt);
        const now = new Date();
        const ageMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
        entries.push({
          label: 'Last Sync',
          value: `${ageMinutes} minutes ago (${date.toLocaleString()})`,
          status: ageMinutes < 30 ? 'ok' : 'warning',
        });
      } else {
        entries.push({
          label: 'Last Sync',
          value: 'Never',
          status: 'info',
        });
      }
    } catch {
      entries.push({
        label: 'Last Sync',
        value: 'Error reading timestamp',
        status: 'error',
      });
    }

    // Exported fingerprints count
    try {
      const fingerprints = await StorageService.getJSON(
        StorageService.STORAGE_KEYS.googleTasksExportedFingerprints,
      );
      const count = Array.isArray(fingerprints) ? fingerprints.length : 0;
      entries.push({
        label: 'Exported Items (Dedupe Cache)',
        value: `${count}`,
        status: 'info',
      });
    } catch {
      entries.push({
        label: 'Exported Items',
        value: 'Error reading cache',
        status: 'error',
      });
    }

    setDiagnostics(entries);
    setIsRefreshing(false);
  }, [loadLastBackupExportAt]);

  useEffect(() => {
    loadDiagnostics();
  }, [loadDiagnostics]);

  const handleRefresh = () => {
    loadDiagnostics();
  };

  const getStatusColor = (status: DiagnosticEntry['status']) => {
    switch (status) {
      case 'ok':
        return Tokens.colors.success.main;
      case 'warning':
        return Tokens.colors.warning.main;
      case 'error':
        return Tokens.colors.error.main;
      case 'info':
      default:
        return Tokens.colors.text.secondary;
    }
  };

  const getStatusIndicator = (status: DiagnosticEntry['status']) => {
    switch (status) {
      case 'ok':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✗';
      case 'info':
      default:
        return '●';
    }
  };

  return (
    <CosmicBackground variant="ridge" dimmer>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Text style={styles.backButtonText}>← BACK</Text>
            </TouchableOpacity>
            <Text style={styles.title}>DIAGNOSTICS</Text>
            <TouchableOpacity
              onPress={handleRefresh}
              style={styles.refreshButton}
              disabled={isRefreshing}
              accessibilityLabel="Refresh diagnostics"
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.refreshButtonText,
                  isRefreshing && styles.refreshButtonTextDisabled,
                ]}
              >
                {isRefreshing ? '...' : '↻'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Diagnostics list */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SYSTEM STATUS</Text>
              {diagnostics.map((entry, index) => (
                <View key={index} style={styles.diagRow}>
                  <View style={styles.diagLabelContainer}>
                    <Text
                      style={[
                        styles.diagIndicator,
                        { color: getStatusColor(entry.status) },
                      ]}
                    >
                      {getStatusIndicator(entry.status)}
                    </Text>
                    <Text style={styles.diagLabel}>{entry.label}</Text>
                  </View>
                  <Text
                    style={[
                      styles.diagValue,
                      { color: getStatusColor(entry.status) },
                    ]}
                    numberOfLines={2}
                  >
                    {entry.value}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SETUP INSTRUCTIONS</Text>
              <Text style={styles.instructionText}>
                To enable Google Tasks/Calendar sync:
              </Text>
              <Text style={styles.instructionStep}>
                1. Create a Firebase project at console.firebase.google.com
              </Text>
              <Text style={styles.instructionStep}>
                2. Add Android app with package ID: com.sparkadhd
              </Text>
              <Text style={styles.instructionStep}>
                3. Download google-services.json to android/app/
              </Text>
              <Text style={styles.instructionStep}>
                4. Enable Google Tasks API in Google Cloud Console
              </Text>
              <Text style={styles.instructionStep}>
                5. Set REACT_APP_GOOGLE_WEB_CLIENT_ID environment variable
              </Text>
              <Text style={styles.instructionStep}>6. Rebuild the app</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DATA BACKUP</Text>
              <Text style={styles.instructionText}>
                Export local data as JSON and import it later to restore this
                device state.
              </Text>
              <Text style={styles.backupMetaText}>
                LAST EXPORT:{' '}
                {lastBackupExportAt
                  ? new Date(lastBackupExportAt).toLocaleString()
                  : 'NEVER'}
              </Text>

              <View style={styles.modeSelectorContainer}>
                <TouchableOpacity
                  onPress={() => setImportMode('overwrite')}
                  style={[
                    styles.modeButton,
                    importMode === 'overwrite' && styles.modeButtonActive,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Set import mode to overwrite"
                  testID="import-mode-overwrite"
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      importMode === 'overwrite' && styles.modeButtonTextActive,
                    ]}
                  >
                    OVERWRITE
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setImportMode('merge')}
                  style={[
                    styles.modeButton,
                    importMode === 'merge' && styles.modeButtonActive,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Set import mode to merge"
                  testID="import-mode-merge"
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      importMode === 'merge' && styles.modeButtonTextActive,
                    ]}
                  >
                    MERGE
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.backupActionsRow}>
                <TouchableOpacity
                  testID="diagnostics-export-backup"
                  onPress={handleExportBackup}
                  disabled={isBackupBusy}
                  style={[
                    styles.backupButton,
                    isBackupBusy && styles.backupButtonDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Export backup JSON"
                >
                  <Text style={styles.backupButtonText}>EXPORT JSON</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  testID="diagnostics-import-backup"
                  onPress={handleImportBackupPress}
                  disabled={isBackupBusy || !backupJson.trim()}
                  style={[
                    styles.backupButton,
                    (isBackupBusy || !backupJson.trim()) &&
                      styles.backupButtonDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Import backup JSON"
                >
                  <Text style={styles.backupButtonText}>IMPORT JSON</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                testID="diagnostics-backup-input"
                style={styles.backupInput}
                value={backupJson}
                onChangeText={setBackupJson}
                multiline
                placeholder="Paste backup JSON here"
                placeholderTextColor={Tokens.colors.text.placeholder}
                textAlignVertical="top"
                accessibilityLabel="Backup JSON input"
              />

              {backupStatus ? (
                <Text style={styles.backupStatusText}>{backupStatus}</Text>
              ) : null}
            </View>

            {/* Appearance / Theme Toggle */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>APPEARANCE</Text>
              <GlowCard
                glow={variant === 'linear' ? 'soft' : 'none'}
                onPress={() => setVariant('linear')}
                style={styles.themeOption}
                accessibilityLabel="Select Linear theme"
                accessibilityRole="button"
                accessibilityState={{ selected: variant === 'linear' }}
              >
                <View style={styles.themeOptionContent}>
                  <View style={styles.themePreview}>
                    <View
                      style={[
                        styles.themePreviewBox,
                        {
                          backgroundColor:
                            THEME_METADATA.linear.preview.background,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.themePreviewAccent,
                          {
                            backgroundColor:
                              THEME_METADATA.linear.preview.accent,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <View style={styles.themeText}>
                    <Text style={styles.themeTitle}>
                      {THEME_METADATA.linear.label}
                    </Text>
                    <Text style={styles.themeDescription}>
                      {THEME_METADATA.linear.description}
                    </Text>
                  </View>
                  {variant === 'linear' && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </GlowCard>

              <View style={styles.spacer8} />

              <GlowCard
                glow={variant === 'cosmic' ? 'soft' : 'none'}
                onPress={() => setVariant('cosmic')}
                style={styles.themeOption}
                accessibilityLabel="Select Cosmic theme"
                accessibilityRole="button"
                accessibilityState={{ selected: variant === 'cosmic' }}
              >
                <View style={styles.themeOptionContent}>
                  <View style={styles.themePreview}>
                    <View
                      style={[
                        styles.themePreviewBox,
                        {
                          backgroundColor:
                            THEME_METADATA.cosmic.preview.background,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.themePreviewAccent,
                          {
                            backgroundColor:
                              THEME_METADATA.cosmic.preview.accent,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <View style={styles.themeText}>
                    <Text style={styles.themeTitle}>
                      {THEME_METADATA.cosmic.label}
                    </Text>
                    <Text style={styles.themeDescription}>
                      {THEME_METADATA.cosmic.description}
                    </Text>
                  </View>
                  {variant === 'cosmic' && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </GlowCard>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </CosmicBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral.darkest,
  },
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral.darkest,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Tokens.spacing[4],
    paddingVertical: Tokens.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Tokens.colors.neutral.border,
  },
  backButton: {
    paddingVertical: Tokens.spacing[1],
    paddingHorizontal: Tokens.spacing[2],
  },
  backButtonText: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: 12,
    fontWeight: '700',
    color: Tokens.colors.indigo.primary,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: 14,
    fontWeight: '700',
    color: Tokens.colors.text.primary,
    letterSpacing: 1,
  },
  refreshButton: {
    paddingVertical: Tokens.spacing[1],
    paddingHorizontal: Tokens.spacing[2],
  },
  refreshButtonText: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: 16,
    fontWeight: '700',
    color: Tokens.colors.indigo.primary,
  },
  refreshButtonTextDisabled: {
    color: Tokens.colors.text.tertiary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Tokens.spacing[4],
  },
  section: {
    marginBottom: Tokens.spacing[6],
  },
  sectionTitle: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    color: Tokens.colors.text.secondary,
    letterSpacing: 1,
    marginBottom: Tokens.spacing[2],
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Tokens.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Tokens.colors.neutral.borderSubtle,
  },
  diagLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  diagIndicator: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: 12,
    marginRight: Tokens.spacing[1],
    width: 16,
  },
  diagLabel: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: 13,
    color: Tokens.colors.text.primary,
    flex: 1,
  },
  diagValue: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: 11,
    textAlign: 'right',
    maxWidth: '50%',
  },
  instructionText: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: 13,
    color: Tokens.colors.text.secondary,
    marginBottom: Tokens.spacing[2],
    lineHeight: 20,
  },
  instructionStep: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: 11,
    color: Tokens.colors.text.primary,
    marginBottom: Tokens.spacing[1],
    paddingLeft: Tokens.spacing[2],
    lineHeight: 18,
  },
  backupActionsRow: {
    flexDirection: 'row',
    gap: Tokens.spacing[2],
    marginBottom: Tokens.spacing[2],
  },
  backupButton: {
    flex: 1,
    minHeight: Tokens.layout.minTapTarget,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.border,
    backgroundColor: Tokens.colors.neutral.dark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Tokens.spacing[1],
    paddingHorizontal: Tokens.spacing[2],
  },
  backupButtonDisabled: {
    opacity: 0.5,
  },
  backupButtonText: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    color: Tokens.colors.text.primary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  backupInput: {
    minHeight: Tokens.layout.minTapTargetComfortable * 4,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.border,
    backgroundColor: Tokens.colors.neutral.darker,
    color: Tokens.colors.text.primary,
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    padding: Tokens.spacing[2],
  },
  backupStatusText: {
    marginTop: Tokens.spacing[2],
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    color: Tokens.colors.text.secondary,
  },
  backupMetaText: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    color: Tokens.colors.text.tertiary,
    marginBottom: Tokens.spacing[2],
    letterSpacing: 0.5,
  },
  modeSelectorContainer: {
    flexDirection: 'row',
    marginBottom: Tokens.spacing[2],
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.border,
    backgroundColor: Tokens.colors.neutral.darker,
  },
  modeButton: {
    flex: 1,
    paddingVertical: Tokens.spacing[1],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  modeButtonActive: {
    backgroundColor: Tokens.colors.neutral.dark,
  },
  modeButtonText: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: 10,
    color: Tokens.colors.text.secondary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  modeButtonTextActive: {
    color: Tokens.colors.text.primary,
  },
  themeOption: {
    marginBottom: 0,
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themePreview: {
    marginRight: Tokens.spacing[4],
  },
  themePreviewBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  themePreviewAccent: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  themeText: {
    flex: 1,
  },
  themeTitle: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.base,
    fontWeight: '700',
    color: Tokens.colors.text.primary,
    marginBottom: 2,
  },
  themeDescription: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.sm,
    color: Tokens.colors.text.secondary,
  },
  spacer8: {
    height: 8,
  },
  checkmark: {
    fontSize: 20,

    color: Tokens.colors.success.main,
    marginLeft: Tokens.spacing[2],
  },
});

export default DiagnosticsScreen;

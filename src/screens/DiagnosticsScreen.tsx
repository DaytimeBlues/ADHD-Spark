import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Tokens } from '../theme/tokens';
import { GoogleTasksSyncService } from '../services/PlaudService';
import { config } from '../config';
import StorageService from '../services/StorageService';

interface DiagnosticEntry {
  label: string;
  value: string;
  status: 'ok' | 'warning' | 'error' | 'info';
}

type NavigationNode = {
  goBack: () => void;
};

const DiagnosticsScreen = ({ navigation }: { navigation: NavigationNode }) => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDiagnostics = async () => {
    setIsRefreshing(true);
    const entries: DiagnosticEntry[] = [];

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
        const ageMinutes = Math.floor(
          (now.getTime() - date.getTime()) / 60000,
        );
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
  };

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const handleRefresh = () => {
    loadDiagnostics();
  };

  const getStatusColor = (status: DiagnosticEntry['status']) => {
    switch (status) {
      case 'ok':
        return Tokens.colors.success;
      case 'warning':
        return Tokens.colors.warning;
      case 'error':
        return Tokens.colors.error;
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
            <Text style={styles.instructionStep}>
              6. Rebuild the app
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
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
    paddingHorizontal: Tokens.spacing.md,
    paddingVertical: Tokens.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Tokens.colors.neutral.border,
  },
  backButton: {
    paddingVertical: Tokens.spacing.xs,
    paddingHorizontal: Tokens.spacing.sm,
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
    paddingVertical: Tokens.spacing.xs,
    paddingHorizontal: Tokens.spacing.sm,
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
    padding: Tokens.spacing.md,
  },
  section: {
    marginBottom: Tokens.spacing.lg,
  },
  sectionTitle: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    color: Tokens.colors.text.secondary,
    letterSpacing: 1,
    marginBottom: Tokens.spacing.sm,
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Tokens.spacing.sm,
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
    marginRight: Tokens.spacing.xs,
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
    marginBottom: Tokens.spacing.sm,
    lineHeight: 20,
  },
  instructionStep: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: 11,
    color: Tokens.colors.text.primary,
    marginBottom: Tokens.spacing.xs,
    paddingLeft: Tokens.spacing.sm,
    lineHeight: 18,
  },
});

export default DiagnosticsScreen;

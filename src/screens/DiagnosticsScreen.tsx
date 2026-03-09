import React from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Tokens } from '../theme/tokens';
import { CosmicBackground } from '../ui/cosmic';
import {
  BackupSection,
  DiagnosticsStatusSection,
  SetupInstructionsSection,
  ThemeSection,
} from './diagnostics/components';
import {
  useBackupManager,
  useDiagnosticsData,
  useThemeSwitcher,
} from './diagnostics/hooks';

type NavigationNode = {
  goBack: () => void;
};

type DiagnosticsPressableState = {
  focused?: boolean;
  hovered?: boolean;
  pressed: boolean;
};

const webFocusOutline: object =
  Platform.OS === 'web'
    ? {
        outlineWidth: 2,
        outlineStyle: 'solid',
        outlineColor: Tokens.colors.indigo.primary,
      }
    : {};

const DiagnosticsScreen = ({ navigation }: { navigation: NavigationNode }) => {
  const { diagnostics, isRefreshing, refreshDiagnostics } =
    useDiagnosticsData();
  const {
    backupJson,
    setBackupJson,
    isBackupBusy,
    backupStatus,
    importMode,
    setImportMode,
    lastBackupExportAt,
    exportBackup,
    importBackup,
  } = useBackupManager({ onImported: refreshDiagnostics });
  const { themeOptions, selectTheme } = useThemeSwitcher();

  return (
    <CosmicBackground variant="ridge" dimmer>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={(state: DiagnosticsPressableState) => [
                styles.backButton,
                state.focused && styles.backButtonFocused,
              ]}
              accessibilityLabel="Go back"
              accessibilityHint="Returns to previous screen"
              accessibilityRole="button"
            >
              <Text style={styles.backButtonText}>{'< BACK'}</Text>
            </Pressable>

            <Text style={styles.title}>DIAGNOSTICS</Text>

            <Pressable
              onPress={() => {
                refreshDiagnostics().catch(() => undefined);
              }}
              style={(state: DiagnosticsPressableState) => [
                styles.refreshButton,
                state.focused && styles.refreshButtonFocused,
              ]}
              disabled={isRefreshing}
              accessibilityLabel="Refresh diagnostics"
              accessibilityHint="Reloads the system status information"
              accessibilityRole="button"
              accessibilityState={{ disabled: isRefreshing }}
            >
              <Text
                style={[
                  styles.refreshButtonText,
                  isRefreshing && styles.refreshButtonTextDisabled,
                ]}
              >
                {isRefreshing ? '...' : 'REFRESH'}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            <DiagnosticsStatusSection diagnostics={diagnostics} />
            <SetupInstructionsSection />
            <BackupSection
              backupJson={backupJson}
              setBackupJson={setBackupJson}
              isBackupBusy={isBackupBusy}
              backupStatus={backupStatus}
              importMode={importMode}
              setImportMode={setImportMode}
              lastBackupExportAt={lastBackupExportAt}
              onExport={exportBackup}
              onImport={importBackup}
            />
            <ThemeSection
              themeOptions={themeOptions}
              onSelectTheme={selectTheme}
            />
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
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    paddingVertical: Tokens.spacing[1],
    paddingHorizontal: Tokens.spacing[2],
  },
  backButtonFocused: {
    ...webFocusOutline,
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
    minHeight: Tokens.layout.minTapTarget,
    minWidth: Tokens.layout.minTapTarget,
    paddingVertical: Tokens.spacing[1],
    paddingHorizontal: Tokens.spacing[2],
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonFocused: {
    ...webFocusOutline,
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
});

export default DiagnosticsScreen;

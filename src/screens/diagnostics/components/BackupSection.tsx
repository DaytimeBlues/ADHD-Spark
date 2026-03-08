import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Tokens } from '../../../theme/tokens';
import type { BackupImportMode } from '../types';

type BackupSectionProps = {
  backupJson: string;
  setBackupJson: (value: string) => void;
  isBackupBusy: boolean;
  backupStatus: string;
  importMode: BackupImportMode;
  setImportMode: (mode: BackupImportMode) => void;
  lastBackupExportAt: string | null;
  onExport: () => Promise<void>;
  onImport: () => Promise<void>;
};

export const BackupSection = ({
  backupJson,
  setBackupJson,
  isBackupBusy,
  backupStatus,
  importMode,
  setImportMode,
  lastBackupExportAt,
  onExport,
  onImport,
}: BackupSectionProps) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>DATA BACKUP</Text>
      <Text style={styles.instructionText}>
        Export local data as JSON and import it later to restore this device
        state.
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
          onPress={() => {
            onExport().catch(() => undefined);
          }}
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
          onPress={() => {
            onImport().catch(() => undefined);
          }}
          disabled={isBackupBusy || !backupJson.trim()}
          style={[
            styles.backupButton,
            (isBackupBusy || !backupJson.trim()) && styles.backupButtonDisabled,
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
  );
};

const styles = StyleSheet.create({
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
  instructionText: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: 13,
    color: Tokens.colors.text.secondary,
    marginBottom: Tokens.spacing[2],
    lineHeight: 20,
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
});

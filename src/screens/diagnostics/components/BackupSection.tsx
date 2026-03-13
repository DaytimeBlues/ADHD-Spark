import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LoggerService } from '../../../services/LoggerService';
import { useTheme } from '../../../theme/useTheme';
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
  const { isNightAwe, t } = useTheme();
  const styles = getStyles(
    isNightAwe,
    t.colors.text?.primary,
    t.colors.text?.secondary,
  );

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
          accessibilityHint="Replaces all existing data with the backup"
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
          accessibilityHint="Combines backup data with existing data"
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
            onExport().catch((error) => {
              LoggerService.error({
                service: 'BackupSection',
                operation: 'onExport',
                message: 'Backup export action failed',
                error,
              });
            });
          }}
          disabled={isBackupBusy}
          style={[
            styles.backupButton,
            isBackupBusy && styles.backupButtonDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Export backup JSON"
          accessibilityHint="Downloads your app data as a JSON file"
        >
          <Text style={styles.backupButtonText}>EXPORT JSON</Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="diagnostics-import-backup"
          onPress={() => {
            onImport().catch((error) => {
              LoggerService.error({
                service: 'BackupSection',
                operation: 'onImport',
                message: 'Backup import action failed',
                error,
                context: { importMode },
              });
            });
          }}
          disabled={isBackupBusy || !backupJson.trim()}
          style={[
            styles.backupButton,
            (isBackupBusy || !backupJson.trim()) && styles.backupButtonDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Import backup JSON"
          accessibilityHint="Restores your app data from a JSON file"
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
        placeholderTextColor={
          isNightAwe
            ? t.colors.text?.secondary || Tokens.colors.text.placeholder
            : Tokens.colors.text.placeholder
        }
        textAlignVertical="top"
        accessibilityLabel="Backup JSON input"
      />

      {backupStatus ? (
        <Text style={styles.backupStatusText}>{backupStatus}</Text>
      ) : null}
    </View>
  );
};

const getStyles = (
  isNightAwe: boolean,
  primaryText: string | undefined = Tokens.colors.text.primary,
  secondaryText: string | undefined = Tokens.colors.text.secondary,
) =>
  StyleSheet.create({
    section: {
      marginBottom: Tokens.spacing[6],
    },
    sectionTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: 10,
      fontWeight: '700',
      color: isNightAwe
        ? secondaryText || '#C9D5E8'
        : Tokens.colors.text.secondary,
      letterSpacing: 1,
      marginBottom: Tokens.spacing[2],
    },
    instructionText: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: 13,
      color: isNightAwe
        ? secondaryText || '#C9D5E8'
        : Tokens.colors.text.secondary,
      marginBottom: Tokens.spacing[2],
      lineHeight: 20,
    },
    backupMetaText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: isNightAwe
        ? secondaryText || '#C9D5E8'
        : Tokens.colors.text.tertiary,
      marginBottom: Tokens.spacing[2],
      letterSpacing: 0.5,
    },
    modeSelectorContainer: {
      flexDirection: 'row',
      marginBottom: Tokens.spacing[2],
      borderWidth: 1,
      borderColor: isNightAwe
        ? 'rgba(175, 199, 255, 0.16)'
        : Tokens.colors.neutral.border,
      backgroundColor: isNightAwe ? '#16283F' : Tokens.colors.neutral.darker,
    },
    modeButton: {
      flex: 1,
      minHeight: Tokens.layout.minTapTarget,
      paddingVertical: Tokens.spacing[1],
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    modeButtonActive: {
      backgroundColor: isNightAwe
        ? 'rgba(175, 199, 255, 0.12)'
        : Tokens.colors.neutral.dark,
    },
    modeButtonText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: 10,
      color: isNightAwe
        ? secondaryText || '#C9D5E8'
        : Tokens.colors.text.secondary,
      fontWeight: '700',
      letterSpacing: 1,
    },
    modeButtonTextActive: {
      color: isNightAwe ? primaryText || '#F6F1E7' : Tokens.colors.text.primary,
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
      borderColor: isNightAwe
        ? 'rgba(175, 199, 255, 0.16)'
        : Tokens.colors.neutral.border,
      backgroundColor: isNightAwe ? '#16283F' : Tokens.colors.neutral.dark,
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
      color: isNightAwe ? primaryText || '#F6F1E7' : Tokens.colors.text.primary,
      fontWeight: '700',
      letterSpacing: 1,
    },
    backupInput: {
      minHeight: Tokens.layout.minTapTargetComfortable * 4,
      borderWidth: 1,
      borderColor: isNightAwe
        ? 'rgba(175, 199, 255, 0.16)'
        : Tokens.colors.neutral.border,
      backgroundColor: isNightAwe ? '#16283F' : Tokens.colors.neutral.darker,
      color: isNightAwe ? primaryText || '#F6F1E7' : Tokens.colors.text.primary,
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      padding: Tokens.spacing[2],
    },
    backupStatusText: {
      marginTop: Tokens.spacing[2],
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: isNightAwe
        ? secondaryText || '#C9D5E8'
        : Tokens.colors.text.secondary,
    },
  });

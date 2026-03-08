import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Tokens } from '../../../theme/tokens';
import type { DiagnosticEntry } from '../types';

type DiagnosticsStatusSectionProps = {
  diagnostics: DiagnosticEntry[];
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
      return '+';
    case 'warning':
      return '!';
    case 'error':
      return 'x';
    case 'info':
    default:
      return 'o';
  }
};

export const DiagnosticsStatusSection = ({
  diagnostics,
}: DiagnosticsStatusSectionProps) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>SYSTEM STATUS</Text>
      {diagnostics.map((entry, index) => (
        <View key={`${entry.label}-${index}`} style={styles.diagRow}>
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
            style={[styles.diagValue, { color: getStatusColor(entry.status) }]}
            numberOfLines={2}
          >
            {entry.value}
          </Text>
        </View>
      ))}
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
    textAlign: 'center',
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
});

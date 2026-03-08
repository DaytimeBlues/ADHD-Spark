import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Tokens } from '../../theme/tokens';

const SESSION_BADGE_SIZE = 28;

interface PomodoroSessionCounterProps {
  isCosmic: boolean;
  sessions: number;
}

export const PomodoroSessionCounter = ({
  isCosmic,
  sessions,
}: PomodoroSessionCounterProps) => {
  const styles = getStyles(isCosmic);

  return (
    <View style={styles.sessionCounter}>
      <View style={styles.sessionBadge}>
        <Text style={styles.sessionCount}>{sessions}</Text>
      </View>
      <Text style={styles.sessionLabel}>COMPLETED SESSIONS</Text>
    </View>
  );
};

const getStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    sessionCounter: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Tokens.spacing[8],
      backgroundColor: isCosmic
        ? 'rgba(17, 26, 51, 0.6)'
        : Tokens.colors.neutral.darker,
      paddingHorizontal: Tokens.spacing[4],
      paddingVertical: Tokens.spacing[2],
      borderRadius: isCosmic ? 8 : Tokens.radii.none,
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(185, 194, 217, 0.12)'
        : Tokens.colors.neutral.borderSubtle,
      gap: Tokens.spacing[3],
      ...(isCosmic
        ? Platform.select({
            web: {
              backdropFilter: 'blur(8px)',
              boxShadow:
                '0 0 0 1px rgba(139, 92, 246, 0.08), 0 8px 20px rgba(7, 7, 18, 0.4)',
            },
          })
        : {}),
    },
    sessionBadge: {
      backgroundColor: isCosmic ? '#0B1022' : Tokens.colors.brand[900],
      width: SESSION_BADGE_SIZE,
      height: SESSION_BADGE_SIZE,
      borderRadius: isCosmic ? 6 : 0,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isCosmic ? '#8B5CF6' : Tokens.colors.brand[700],
    },
    sessionCount: {
      fontFamily: Tokens.type.fontFamily.mono,
      color: isCosmic ? '#EEF2FF' : Tokens.colors.brand[100],
      fontSize: Tokens.type.sm,
      fontWeight: '700',
    },
    sessionLabel: {
      fontFamily: Tokens.type.fontFamily.sans,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.tertiary,
      fontSize: Tokens.type.sm,
      letterSpacing: 0.5,
    },
  });

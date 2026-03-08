import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Tokens } from '../../theme/tokens';
import { isWeb } from '../../utils/PlatformUtils';

interface PomodoroHeaderProps {
  isCosmic: boolean;
  isWorking: boolean;
}

export const PomodoroHeader = ({
  isCosmic,
  isWorking,
}: PomodoroHeaderProps) => {
  const styles = getStyles(isCosmic);

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>POMODORO</Text>
        <Text style={styles.subtitle}>
          {isWorking ? 'FOCUS BLOCK' : 'RECOVERY BREAK'}
        </Text>
      </View>

      <View style={styles.rationaleCard}>
        <Text style={styles.rationaleTitle}>WHY THIS WORKS</Text>
        <Text style={styles.rationaleText}>
          Structured work/break cycles align with ADHD dopamine regulation.
          Short bursts (25 min) prevent hyperfocus burnout, while mandatory
          breaks restore attention. Evidence-based from CBT time-management
          protocols for sustained task persistence.
        </Text>
      </View>
    </>
  );
};

const getStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    header: {
      alignItems: 'center',
      marginBottom: Tokens.spacing[10],
    },
    title: {
      fontFamily: isCosmic ? 'Space Grotesk' : Tokens.type.fontFamily.sans,
      fontSize: Tokens.type['4xl'],
      fontWeight: '800',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      marginBottom: Tokens.spacing[2],
      letterSpacing: 2,
      textAlign: 'center',
      ...(isCosmic && isWeb
        ? {
            textShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
          }
        : {}),
    },
    subtitle: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.base,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.tertiary,
      textAlign: 'center',
      letterSpacing: 1,
      ...Platform.select({
        web: { transition: Tokens.motion.transitions.base },
      }),
    },
    rationaleCard: {
      backgroundColor: isCosmic
        ? 'rgba(17, 26, 51, 0.6)'
        : Tokens.colors.neutral.darker,
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(185, 194, 217, 0.12)'
        : Tokens.colors.neutral.borderSubtle,
      padding: Tokens.spacing[4],
      marginBottom: Tokens.spacing[6],
      borderRadius: isCosmic ? 12 : 0,
      ...(isCosmic && isWeb
        ? {
            backdropFilter: 'blur(12px)',
            boxShadow:
              '0 0 0 1px rgba(139, 92, 246, 0.08), 0 8px 20px rgba(7, 7, 18, 0.4)',
          }
        : {}),
    },
    rationaleTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
      letterSpacing: 1,
      marginBottom: Tokens.spacing[2],
      textTransform: 'uppercase',
    },
    rationaleText: {
      fontFamily: Tokens.type.fontFamily.body,
      fontSize: Tokens.type.sm,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
      lineHeight: 22,
      flexWrap: 'wrap',
    },
  });

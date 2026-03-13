import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import type { ThemeTokens } from '../../theme/types';
import type { ThemeVariant } from '../../theme/themeVariant';
import { Tokens } from '../../theme/tokens';

const SESSION_BADGE_SIZE = 28;

interface PomodoroSessionCounterProps {
  variant: ThemeVariant;
  t: ThemeTokens;
  sessions: number;
}

export const PomodoroSessionCounter = ({
  variant,
  t,
  sessions,
}: PomodoroSessionCounterProps) => {
  const styles = getStyles(variant, t);

  return (
    <View style={styles.sessionCounter}>
      <View style={styles.sessionBadge}>
        <Text style={styles.sessionCount}>{sessions}</Text>
      </View>
      <Text style={styles.sessionLabel}>COMPLETED SESSIONS</Text>
    </View>
  );
};

const getStyles = (variant: ThemeVariant, t: ThemeTokens) => {
  const isCosmic = variant === 'cosmic';
  const isNightAwe = variant === 'nightAwe';
  const textColors = t.colors.text ?? Tokens.colors.text;

  return StyleSheet.create({
    sessionCounter: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Tokens.spacing[8],
      backgroundColor: isCosmic
        ? 'rgba(17, 26, 51, 0.6)'
        : isNightAwe
          ? '#16283F'
          : Tokens.colors.neutral.darker,
      paddingHorizontal: Tokens.spacing[4],
      paddingVertical: Tokens.spacing[2],
      borderRadius: isCosmic || isNightAwe ? 8 : Tokens.radii.none,
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(185, 194, 217, 0.12)'
        : isNightAwe
          ? 'rgba(175, 199, 255, 0.16)'
          : Tokens.colors.neutral.borderSubtle,
      gap: Tokens.spacing[3],
      ...(isCosmic || isNightAwe
        ? Platform.select({
            web: {
              backdropFilter: 'blur(8px)',
              boxShadow: isNightAwe
                ? '0 0 0 1px rgba(175, 199, 255, 0.08), 0 8px 20px rgba(8, 17, 30, 0.28)'
                : '0 0 0 1px rgba(139, 92, 246, 0.08), 0 8px 20px rgba(7, 7, 18, 0.4)',
            },
          })
        : {}),
    },
    sessionBadge: {
      backgroundColor: isCosmic
        ? '#0B1022'
        : isNightAwe
          ? 'rgba(8, 17, 30, 0.78)'
          : Tokens.colors.brand[900],
      width: SESSION_BADGE_SIZE,
      height: SESSION_BADGE_SIZE,
      borderRadius: isCosmic || isNightAwe ? 6 : 0,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isCosmic
        ? '#8B5CF6'
        : isNightAwe
          ? t.colors.nightAwe?.feature?.pomodoro || '#E8B66B'
          : Tokens.colors.brand[700],
    },
    sessionCount: {
      fontFamily: Tokens.type.fontFamily.mono,
      color: isCosmic
        ? '#EEF2FF'
        : isNightAwe
          ? textColors.primary || '#F6F1E7'
          : Tokens.colors.brand[100],
      fontSize: Tokens.type.sm,
      fontWeight: '700',
    },
    sessionLabel: {
      fontFamily: Tokens.type.fontFamily.sans,
      color: isCosmic
        ? '#B9C2D9'
        : isNightAwe
          ? textColors.secondary || '#C9D5E8'
          : Tokens.colors.text.tertiary,
      fontSize: Tokens.type.sm,
      letterSpacing: 0.5,
    },
  });
};

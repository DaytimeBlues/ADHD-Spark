import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import type { ThemeTokens } from '../../theme/types';
import type { ThemeVariant } from '../../theme/themeVariant';
import { Tokens } from '../../theme/tokens';
import { isWeb } from '../../utils/PlatformUtils';

interface PomodoroHeaderProps {
  variant: ThemeVariant;
  t: ThemeTokens;
  isWorking: boolean;
}

export const PomodoroHeader = ({
  variant,
  t,
  isWorking,
}: PomodoroHeaderProps) => {
  const styles = getStyles(variant, t);

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

const getStyles = (variant: ThemeVariant, t: ThemeTokens) => {
  const isCosmic = variant === 'cosmic';
  const isNightAwe = variant === 'nightAwe';
  const textColors = t.colors.text ?? Tokens.colors.text;
  const accent = isNightAwe
    ? t.colors.nightAwe?.feature?.pomodoro || '#E8B66B'
    : '#8B5CF6';

  return StyleSheet.create({
    header: {
      alignItems: 'center',
      marginBottom: Tokens.spacing[10],
    },
    title: {
      fontFamily:
        isCosmic || isNightAwe ? 'Space Grotesk' : Tokens.type.fontFamily.sans,
      fontSize: Tokens.type['4xl'],
      fontWeight: '800',
      color: isNightAwe
        ? textColors.primary || '#F6F1E7'
        : isCosmic
          ? '#EEF2FF'
          : Tokens.colors.text.primary,
      marginBottom: Tokens.spacing[2],
      letterSpacing: 2,
      textAlign: 'center',
      ...((isCosmic || isNightAwe) && isWeb
        ? {
            textShadow: isNightAwe
              ? '0 0 18px rgba(175, 199, 255, 0.18)'
              : '0 0 20px rgba(139, 92, 246, 0.3)',
          }
        : {}),
    },
    subtitle: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.base,
      color: isNightAwe
        ? textColors.secondary || '#C9D5E8'
        : isCosmic
          ? '#B9C2D9'
          : Tokens.colors.text.tertiary,
      textAlign: 'center',
      letterSpacing: 1,
      ...Platform.select({
        web: { transition: Tokens.motion.transitions.base },
      }),
    },
    rationaleCard: {
      backgroundColor: isCosmic
        ? 'rgba(17, 26, 51, 0.6)'
        : isNightAwe
          ? '#16283F'
          : Tokens.colors.neutral.darker,
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(185, 194, 217, 0.12)'
        : isNightAwe
          ? 'rgba(175, 199, 255, 0.16)'
          : Tokens.colors.neutral.borderSubtle,
      padding: Tokens.spacing[4],
      marginBottom: Tokens.spacing[6],
      borderRadius: isCosmic || isNightAwe ? 12 : 0,
      ...((isCosmic || isNightAwe) && isWeb
        ? {
            backdropFilter: 'blur(12px)',
            boxShadow: isNightAwe
              ? '0 0 0 1px rgba(175, 199, 255, 0.08), 0 8px 20px rgba(8, 17, 30, 0.28)'
              : '0 0 0 1px rgba(139, 92, 246, 0.08), 0 8px 20px rgba(7, 7, 18, 0.4)',
          }
        : {}),
    },
    rationaleTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: isNightAwe
        ? accent
        : isCosmic
          ? '#8B5CF6'
          : Tokens.colors.brand[500],
      letterSpacing: 1,
      marginBottom: Tokens.spacing[2],
      textTransform: 'uppercase',
    },
    rationaleText: {
      fontFamily: Tokens.type.fontFamily.body,
      fontSize: Tokens.type.sm,
      color: isNightAwe
        ? textColors.secondary || '#C9D5E8'
        : isCosmic
          ? '#B9C2D9'
          : Tokens.colors.text.secondary,
      lineHeight: 22,
      flexWrap: 'wrap',
    },
  });
};

import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Tokens } from '../../theme/tokens';
import { ChronoDigits, HaloRing } from '../../ui/cosmic';

const TIMER_CARD_SIZE = 280;

interface PomodoroTimerCardProps {
  isCosmic: boolean;
  isWorking: boolean;
  isRunning: boolean;
  timeLeft: number;
  formattedTime: string;
  totalDuration: number;
}

const getPhaseLabel = (isWorking: boolean) => {
  return isWorking ? '🔥 FOCUS' : '🌿 REST';
};

export const PomodoroTimerCard = ({
  isCosmic,
  isWorking,
  isRunning,
  timeLeft,
  formattedTime,
  totalDuration,
}: PomodoroTimerCardProps) => {
  const styles = getStyles(isCosmic);

  return (
    <View style={styles.timerCard}>
      {isCosmic ? (
        <>
          <HaloRing
            mode="progress"
            progress={1 - timeLeft / totalDuration}
            size={TIMER_CARD_SIZE}
            glow={isRunning ? 'strong' : 'medium'}
          />
          <View style={styles.timerOverlay}>
            <ChronoDigits
              testID="timer-display"
              value={formattedTime}
              size="hero"
              glow={isRunning ? 'strong' : 'none'}
              color={isWorking ? 'default' : 'success'}
            />
            <Text
              testID="pomodoro-phase"
              style={[
                styles.phaseText,
                isWorking ? styles.phaseTextFocus : styles.phaseTextBreak,
              ]}
            >
              {getPhaseLabel(isWorking)}
            </Text>
          </View>
        </>
      ) : (
        <>
          <View
            style={[
              styles.phaseIndicator,
              isWorking
                ? styles.phaseIndicatorFocus
                : styles.phaseIndicatorBreak,
            ]}
          />
          <Text testID="timer-display" style={styles.timer}>
            {formattedTime}
          </Text>
          <Text
            testID="pomodoro-phase"
            style={[
              styles.phaseText,
              isWorking ? styles.phaseTextFocus : styles.phaseTextBreak,
            ]}
          >
            {getPhaseLabel(isWorking)}
          </Text>
        </>
      )}
    </View>
  );
};

const getStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    timerCard: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Tokens.spacing[12],
      width: TIMER_CARD_SIZE,
      height: TIMER_CARD_SIZE,
      position: 'relative',
      borderRadius: Tokens.radii.full,
      backgroundColor: isCosmic ? 'transparent' : Tokens.colors.neutral.darker,
      borderWidth: isCosmic ? 0 : 1,
      borderColor: isCosmic
        ? 'transparent'
        : Tokens.colors.neutral.borderSubtle,
    },
    timerOverlay: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    phaseIndicator: {
      position: 'absolute',
      top: -1,
      left: -1,
      right: -1,
      bottom: -1,
      borderRadius: Tokens.radii.full,
      borderWidth: 2,
      opacity: 1,
      ...Platform.select({
        web: { transition: Tokens.motion.transitions.slow },
      }),
    },
    phaseIndicatorFocus: {
      borderColor: Tokens.colors.error.main,
      backgroundColor: 'transparent',
    },
    phaseIndicatorBreak: {
      borderColor: Tokens.colors.success.main,
      backgroundColor: 'transparent',
    },
    timer: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.giga,
      fontWeight: '700',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      fontVariant: ['tabular-nums'],
      textAlign: 'center',
      letterSpacing: -2,
    },
    phaseText: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.xl,
      fontWeight: '600',
      marginTop: Tokens.spacing[2],
      textTransform: 'uppercase',
      letterSpacing: 2,
      ...Platform.select({
        web: { transition: Tokens.motion.transitions.base },
      }),
    },
    phaseTextFocus: {
      color: isCosmic ? '#EF4444' : Tokens.colors.error.main,
    },
    phaseTextBreak: {
      color: isCosmic ? '#22C55E' : Tokens.colors.success.main,
    },
  });

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearButton } from '../../components/ui/LinearButton';
import type { ThemeTokens } from '../../theme/types';
import type { ThemeVariant } from '../../theme/themeVariant';
import { Tokens } from '../../theme/tokens';
import { RuneButton } from '../../ui/cosmic';

interface PomodoroControlsProps {
  variant: ThemeVariant;
  t: ThemeTokens;
  isRunning: boolean;
  isWorking: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export const PomodoroControls = ({
  variant,
  t,
  isRunning,
  isWorking,
  onStart,
  onPause,
  onReset,
}: PomodoroControlsProps) => {
  const styles = getStyles(variant, t);
  const isCosmic = variant === 'cosmic';
  const isNightAwe = variant === 'nightAwe';

  const renderNightAweButton = (
    label: string,
    onPress: () => void,
    buttonStyle: object,
    textStyle?: object,
  ) => (
    <RuneButton onPress={onPress} style={[styles.controlBtn, buttonStyle]}>
      <Text style={[styles.nightAweButtonText, textStyle]}>{label}</Text>
    </RuneButton>
  );

  return (
    <View style={styles.controls}>
      {!isRunning ? (
        isCosmic ? (
          <RuneButton
            variant="primary"
            size="lg"
            glow="medium"
            onPress={onStart}
            style={styles.controlBtn}
          >
            Start Timer
          </RuneButton>
        ) : isNightAwe ? (
          renderNightAweButton(
            'Start Timer',
            onStart,
            styles.nightAwePrimaryButton,
          )
        ) : (
          <LinearButton
            title="Start Timer"
            onPress={onStart}
            variant={isWorking ? 'primary' : 'secondary'}
            size="lg"
            style={styles.controlBtn}
          />
        )
      ) : isCosmic ? (
        <RuneButton
          variant="secondary"
          size="lg"
          onPress={onPause}
          style={styles.controlBtn}
        >
          Pause
        </RuneButton>
      ) : isNightAwe ? (
        renderNightAweButton(
          'Pause',
          onPause,
          styles.nightAweSecondaryButton,
          styles.nightAweSecondaryButtonText,
        )
      ) : (
        <LinearButton
          title="Pause"
          onPress={onPause}
          variant="secondary"
          size="lg"
          style={styles.controlBtn}
        />
      )}

      {isNightAwe ? (
        renderNightAweButton(
          'Reset',
          onReset,
          styles.nightAweGhostButton,
          styles.nightAweGhostButtonText,
        )
      ) : isCosmic ? (
        <RuneButton
          variant="ghost"
          size="md"
          onPress={onReset}
          style={styles.controlBtn}
        >
          Reset
        </RuneButton>
      ) : (
        <LinearButton
          title="Reset"
          onPress={onReset}
          variant="ghost"
          size="md"
        />
      )}
    </View>
  );
};

const getStyles = (variant: ThemeVariant, t: ThemeTokens) => {
  const isCosmic = variant === 'cosmic';
  const isNightAwe = variant === 'nightAwe';
  const textColors = t.colors.text ?? Tokens.colors.text;

  return StyleSheet.create({
    controls: {
      width: '100%',
      maxWidth: 320,
      gap: Tokens.spacing[4],
      marginTop: Tokens.spacing[8],
    },
    controlBtn: {
      width: '100%',
      borderRadius: isCosmic || isNightAwe ? 8 : 0,
    },
    nightAwePrimaryButton: {
      backgroundColor: t.colors.nightAwe?.feature?.pomodoro || '#E8B66B',
      borderColor: t.colors.nightAwe?.feature?.pomodoro || '#E8B66B',
    },
    nightAweSecondaryButton: {
      backgroundColor: 'rgba(175, 199, 255, 0.12)',
      borderColor: 'rgba(175, 199, 255, 0.36)',
    },
    nightAweGhostButton: {
      backgroundColor: 'transparent',
      borderColor: 'rgba(175, 199, 255, 0.16)',
    },
    nightAweButtonText: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: 16,
      fontWeight: '700',
      color: Tokens.colors.neutral.darkest,
    },
    nightAweSecondaryButtonText: {
      color: textColors.primary || '#F6F1E7',
    },
    nightAweGhostButtonText: {
      color: textColors.secondary || '#C9D5E8',
    },
  });
};

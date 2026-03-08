import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearButton } from '../../components/ui/LinearButton';
import { Tokens } from '../../theme/tokens';
import { RuneButton } from '../../ui/cosmic';

interface PomodoroControlsProps {
  isCosmic: boolean;
  isRunning: boolean;
  isWorking: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export const PomodoroControls = ({
  isCosmic,
  isRunning,
  isWorking,
  onStart,
  onPause,
  onReset,
}: PomodoroControlsProps) => {
  const styles = getStyles(isCosmic);

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
      ) : (
        <LinearButton
          title="Pause"
          onPress={onPause}
          variant="secondary"
          size="lg"
          style={styles.controlBtn}
        />
      )}

      {isCosmic ? (
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

const getStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    controls: {
      width: '100%',
      maxWidth: 320,
      gap: Tokens.spacing[4],
      marginTop: Tokens.spacing[8],
    },
    controlBtn: {
      width: '100%',
      borderRadius: isCosmic ? 8 : 0,
    },
  });

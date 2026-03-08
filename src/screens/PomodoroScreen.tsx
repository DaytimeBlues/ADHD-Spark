import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { usePomodoroSession } from '../hooks/usePomodoroSession';
import { Tokens } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { CosmicBackground } from '../ui/cosmic';
import { PomodoroControls } from './pomodoro/PomodoroControls';
import { PomodoroHeader } from './pomodoro/PomodoroHeader';
import { PomodoroSessionCounter } from './pomodoro/PomodoroSessionCounter';
import { PomodoroTimerCard } from './pomodoro/PomodoroTimerCard';

const PomodoroScreen = () => {
  const { isCosmic } = useTheme();
  const styles = getStyles();
  const {
    timeLeft,
    isRunning,
    formattedTime,
    isWorking,
    sessions,
    start,
    pause,
    reset,
    getTotalDuration,
  } = usePomodoroSession();

  return (
    <CosmicBackground variant="nebula" style={StyleSheet.absoluteFill}>
      <SafeAreaView
        style={styles.container}
        accessibilityLabel="Pomodoro screen"
        accessibilityRole="summary"
      >
        <View style={styles.content}>
          <PomodoroHeader isCosmic={isCosmic} isWorking={isWorking} />
          <PomodoroTimerCard
            isCosmic={isCosmic}
            isWorking={isWorking}
            isRunning={isRunning}
            timeLeft={timeLeft}
            formattedTime={formattedTime}
            totalDuration={getTotalDuration()}
          />
          <PomodoroSessionCounter isCosmic={isCosmic} sessions={sessions} />
          <PomodoroControls
            isCosmic={isCosmic}
            isRunning={isRunning}
            isWorking={isWorking}
            onStart={start}
            onPause={pause}
            onReset={reset}
          />
        </View>
      </SafeAreaView>
    </CosmicBackground>
  );
};

const getStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    content: {
      flex: 1,
      padding: Tokens.spacing[6],
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      maxWidth: Tokens.layout.maxWidth.prose,
    },
  });

export default PomodoroScreen;

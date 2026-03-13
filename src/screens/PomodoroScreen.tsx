import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { usePomodoroSession } from '../hooks/usePomodoroSession';
import { Tokens } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { CosmicBackground } from '../ui/cosmic';
import { NightAweBackground } from '../ui/nightAwe';
import { PomodoroControls } from './pomodoro/PomodoroControls';
import { PomodoroHeader } from './pomodoro/PomodoroHeader';
import { PomodoroSessionCounter } from './pomodoro/PomodoroSessionCounter';
import { PomodoroTimerCard } from './pomodoro/PomodoroTimerCard';

const PomodoroScreen = () => {
  const { isCosmic, isNightAwe, variant, t } = useTheme();
  const styles = getStyles(isNightAwe);
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

  const content = (
    <SafeAreaView
      style={styles.container}
      accessibilityLabel="Pomodoro screen"
      accessibilityRole="summary"
    >
      <View style={styles.content}>
        <PomodoroHeader variant={variant} t={t} isWorking={isWorking} />
        <PomodoroTimerCard
          variant={variant}
          t={t}
          isWorking={isWorking}
          isRunning={isRunning}
          timeLeft={timeLeft}
          formattedTime={formattedTime}
          totalDuration={getTotalDuration()}
        />
        <PomodoroSessionCounter variant={variant} t={t} sessions={sessions} />
        <PomodoroControls
          variant={variant}
          t={t}
          isRunning={isRunning}
          isWorking={isWorking}
          onStart={start}
          onPause={pause}
          onReset={reset}
        />
      </View>
    </SafeAreaView>
  );

  if (isNightAwe) {
    return (
      <NightAweBackground
        variant="focus"
        activeFeature="pomodoro"
        motionMode="idle"
        testID="night-awe-background"
      >
        {content}
      </NightAweBackground>
    );
  }

  if (isCosmic) {
    return (
      <CosmicBackground variant="nebula" style={StyleSheet.absoluteFill}>
        {content}
      </CosmicBackground>
    );
  }

  return content;
};

const getStyles = (isNightAwe: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isNightAwe
        ? 'transparent'
        : Tokens.colors.neutral.darkest,
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

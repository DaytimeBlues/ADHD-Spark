import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';
import SoundService from '../services/SoundService';
import StorageService from '../services/StorageService';
import useTimer from '../hooks/useTimer';
import { LinearButton } from '../components/ui/LinearButton';
import { Tokens } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';
import { CosmicBackground, ChronoDigits, RuneButton, HaloRing } from '../ui/cosmic';

type PomodoroState = {
  isWorking: boolean;
  timeLeft: number;
  sessions: number;
};

const SESSION_BADGE_SIZE = 28;
const TIMER_CARD_SIZE = 280;
const FOCUS_DURATION_SECONDS = 25 * 60;
const BREAK_DURATION_SECONDS = 5 * 60;
const PERSIST_INTERVAL_MS = 5000;

const PomodoroScreen = () => {
  const { isCosmic } = useTheme();
  const [isWorking, setIsWorking] = useState(true);
  const [sessions, setSessions] = useState(0);
  const isWorkingRef = useRef(isWorking);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { timeLeft, isRunning, formattedTime, start, pause, reset, setTime } =
    useTimer({
      initialTime: FOCUS_DURATION_SECONDS,
      onComplete: () => {
        if (isWorkingRef.current) {
          setSessions((s) => s + 1);
          setIsWorking(false);
          isWorkingRef.current = false;
          SoundService.playCompletionSound();
          setTime(BREAK_DURATION_SECONDS);
        } else {
          setIsWorking(true);
          isWorkingRef.current = true;
          SoundService.playNotificationSound();
          setTime(FOCUS_DURATION_SECONDS);
        }
        // Re-start for the next phase
        setTimeout(() => start(), 0);
      },
    });

  useEffect(() => {
    isWorkingRef.current = isWorking;
  }, [isWorking]);

  useEffect(() => {
    const loadState = async () => {
      const storedState = await StorageService.getJSON<PomodoroState>(
        StorageService.STORAGE_KEYS.pomodoroState,
      );

      if (!storedState) {
        return;
      }

      if (typeof storedState.isWorking === 'boolean') {
        setIsWorking(storedState.isWorking);
      }

      if (typeof storedState.timeLeft === 'number') {
        setTime(storedState.timeLeft);
      }

      if (typeof storedState.sessions === 'number') {
        setSessions(storedState.sessions);
      }
    };

    loadState();
  }, [setTime]);

  useEffect(() => {
    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current);
    }

    persistTimerRef.current = setTimeout(() => {
      StorageService.setJSON(StorageService.STORAGE_KEYS.pomodoroState, {
        isWorking,
        timeLeft,
        sessions,
      });
    }, PERSIST_INTERVAL_MS);

    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
      }
    };
  }, [isWorking, timeLeft, sessions]);

  const startTimer = () => {
    start();
  };

  const pauseTimer = () => {
    pause();
  };

  const resetTimer = () => {
    reset();
    setIsWorking(true);
    isWorkingRef.current = true;
    setTime(FOCUS_DURATION_SECONDS);
  };

  const getTotalDuration = () => {
    return isWorking ? FOCUS_DURATION_SECONDS : BREAK_DURATION_SECONDS;
  };

  const styles = getStyles(isCosmic);

  return (
    <CosmicBackground variant="nebula" style={StyleSheet.absoluteFill}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>POMODORO</Text>
            <Text style={styles.subtitle}>
              {isWorking ? 'FOCUS BLOCK' : 'RECOVERY BREAK'}
            </Text>
          </View>

          <View style={styles.rationaleCard}>
            <Text style={styles.rationaleTitle}>WHY THIS WORKS</Text>
            <Text style={styles.rationaleText}>
              Structured work/break cycles align with ADHD dopamine regulation. Short bursts (25 min) prevent hyperfocus burnout, while mandatory breaks restore attention. Evidence-based from CBT time-management protocols for sustained task persistence.
            </Text>
          </View>

          <View style={styles.timerCard}>
            {isCosmic ? (
              <>
                <HaloRing
                  mode="progress"
                  progress={1 - timeLeft / getTotalDuration()}
                  size={TIMER_CARD_SIZE}
                  glow={isRunning ? 'strong' : 'medium'}
                />
                <View style={styles.timerOverlay}>
                   <ChronoDigits
                     value={formattedTime}
                     size="hero"
                     glow={isRunning ? 'strong' : 'none'}
                     color={isWorking ? 'default' : 'success'}
                   />
                  <Text
                    testID="pomodoro-phase"
                    style={[styles.phaseText, isWorking ? styles.phaseTextFocus : styles.phaseTextBreak]}
                  >
                    {isWorking ? '🔥 FOCUS' : '🌿 REST'}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={[styles.phaseIndicator, isWorking ? styles.phaseIndicatorFocus : styles.phaseIndicatorBreak]} />
                <Text testID="timer-display" style={styles.timer}>
                  {formattedTime}
                </Text>
                <Text testID="pomodoro-phase" style={[styles.phaseText, isWorking ? styles.phaseTextFocus : styles.phaseTextBreak]}>
                  {isWorking ? '🔥 FOCUS' : '🌿 REST'}
                </Text>
              </>
            )}
          </View>

          <View style={styles.sessionCounter}>
            <View style={styles.sessionBadge}>
              <Text style={styles.sessionCount}>{sessions}</Text>
            </View>
            <Text style={styles.sessionLabel}>COMPLETED SESSIONS</Text>
          </View>

          <View style={styles.controls}>
            {!isRunning ? (
              isCosmic ? (
                <RuneButton
                  variant="primary"
                  size="lg"
                  glow="medium"
                  onPress={startTimer}
                  style={styles.controlBtn}
                >
                  Start Timer
                </RuneButton>
              ) : (
                <LinearButton
                  title="Start Timer"
                  onPress={startTimer}
                  variant={isWorking ? 'primary' : 'secondary'}
                  size="lg"
                  style={styles.controlBtn}
                />
              )
            ) : (
              isCosmic ? (
                <RuneButton
                  variant="secondary"
                  size="lg"
                  onPress={pauseTimer}
                  style={styles.controlBtn}
                >
                  Pause
                </RuneButton>
              ) : (
                <LinearButton
                  title="Pause"
                  onPress={pauseTimer}
                  variant="secondary"
                  size="lg"
                  style={styles.controlBtn}
                />
              )
            )}
            {isCosmic ? (
              <RuneButton
                variant="ghost"
                size="md"
                onPress={resetTimer}
                style={styles.controlBtn}
              >
                Reset
              </RuneButton>
            ) : (
              <LinearButton
                title="Reset"
                onPress={resetTimer}
                variant="ghost"
                size="md"
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </CosmicBackground>
  );
};

// Theme-aware styles
const getStyles = (isCosmic: boolean) => StyleSheet.create({
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
    ...(isCosmic && Platform.OS === 'web' ? {
      textShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
    } : {}),
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
    backgroundColor: isCosmic ? 'rgba(17, 26, 51, 0.6)' : Tokens.colors.neutral.darker,
    borderWidth: 1,
    borderColor: isCosmic ? 'rgba(185, 194, 217, 0.12)' : Tokens.colors.neutral.borderSubtle,
    padding: Tokens.spacing[4],
    marginBottom: Tokens.spacing[6],
    borderRadius: isCosmic ? 12 : 0,
    ...(isCosmic && Platform.OS === 'web' ? {
      backdropFilter: 'blur(12px)',
      boxShadow: '0 0 0 1px rgba(139, 92, 246, 0.08), 0 8px 20px rgba(7, 7, 18, 0.4)',
    } : {}),
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
  sessionCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Tokens.spacing[8],
    backgroundColor: isCosmic ? 'rgba(17, 26, 51, 0.6)' : Tokens.colors.neutral.darker,
    paddingHorizontal: Tokens.spacing[4],
    paddingVertical: Tokens.spacing[2],
    borderRadius: isCosmic ? 8 : Tokens.radii.none,
    borderWidth: 1,
    borderColor: isCosmic ? 'rgba(185, 194, 217, 0.12)' : Tokens.colors.neutral.borderSubtle,
    gap: Tokens.spacing[3],
    ...(isCosmic && Platform.OS === 'web' ? {
      backdropFilter: 'blur(8px)',
      boxShadow: '0 0 0 1px rgba(139, 92, 246, 0.08), 0 8px 20px rgba(7, 7, 18, 0.4)',
    } : {}),
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
    borderColor: isCosmic ? 'transparent' : Tokens.colors.neutral.borderSubtle,
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

export default PomodoroScreen;

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import SoundService from '../services/SoundService';
import StorageService from '../services/StorageService';
import UXMetricsService from '../services/UXMetricsService';
import ActivationService from '../services/ActivationService';
import useTimer from '../hooks/useTimer';
import { Tokens } from '../theme/tokens';
import { LinearButton } from '../components/ui/LinearButton';

const HERO_TIMER_SIZE = 120;
const IGNITE_DURATION_SECONDS = 5 * 60;
const PERSIST_INTERVAL_MS = 5000;

const IgniteScreen = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const { timeLeft, isRunning, formattedTime, start, pause, reset, setTime } =
    useTimer({
      initialTime: IGNITE_DURATION_SECONDS,
      onComplete: () => {
        SoundService.playCompletionSound();
        UXMetricsService.track('ignite_timer_completed');
        const sessionId = sessionIdRef.current;
        if (sessionId) {
          void ActivationService.updateSessionStatus(sessionId, 'completed');
          sessionIdRef.current = null;
        }
      },
    });

  useEffect(() => {
    SoundService.initBrownNoise();

    const loadState = async () => {
      try {
        const pendingStart = await ActivationService.consumePendingStart();

        const storedState = await StorageService.getJSON<{
          timeLeft: number;
          isPlaying: boolean;
          activeSessionId?: string;
        }>(StorageService.STORAGE_KEYS.igniteState);

        if (storedState) {
          UXMetricsService.track('ignite_session_restored');
          if (typeof storedState.timeLeft === 'number') {
            setTime(storedState.timeLeft);
          }

          if (storedState.isPlaying) {
            setIsPlaying(true);
            SoundService.playBrownNoise();
          }

          if (storedState.activeSessionId) {
            sessionIdRef.current = storedState.activeSessionId;
            if (
              storedState.timeLeft > 0 &&
              storedState.timeLeft < IGNITE_DURATION_SECONDS
            ) {
              void ActivationService.updateSessionStatus(
                storedState.activeSessionId,
                'resumed',
              );
            }
          }
        }

        // Check for last active session if no stored session ID
        if (!sessionIdRef.current) {
          const lastActive = await StorageService.getJSON<{
            id: string;
            source: string;
            startedAt: string;
            status: string;
          }>(StorageService.STORAGE_KEYS.lastActiveSession);

          if (lastActive && lastActive.status === 'started') {
            sessionIdRef.current = lastActive.id;
            void ActivationService.updateSessionStatus(
              lastActive.id,
              'resumed',
            );
          }
        }

        if (pendingStart) {
          const newSessionId = await ActivationService.startSession(
            pendingStart.source,
          );
          sessionIdRef.current = newSessionId;
          start();
          UXMetricsService.track('ignite_timer_started_from_pending_handoff');
        }
      } catch (error) {
        console.error('Failed to load ignite state', error);
      } finally {
        setIsRestoring(false);
      }
    };

    loadState();

    return () => {
      SoundService.stopBrownNoise();
      SoundService.releaseBrownNoise();
    };
  }, [setTime, start]);

  useEffect(() => {
    if (persistTimerRef.current) {
      clearTimeout(persistTimerRef.current);
    }

    persistTimerRef.current = setTimeout(() => {
      StorageService.setJSON(StorageService.STORAGE_KEYS.igniteState, {
        timeLeft,
        isPlaying,
        activeSessionId: sessionIdRef.current,
      });
    }, PERSIST_INTERVAL_MS);

    return () => {
      if (persistTimerRef.current) {
        clearTimeout(persistTimerRef.current);
      }
    };
  }, [timeLeft, isPlaying]);

  const startTimer = () => {
    if (!sessionIdRef.current) {
      void ActivationService.startSession('ignite').then((sessionId) => {
        sessionIdRef.current = sessionId;
      });
    }
    start();
    UXMetricsService.track('ignite_timer_started');
  };

  const pauseTimer = () => {
    pause();
    const sessionId = sessionIdRef.current;
    if (sessionId) {
      void ActivationService.updateSessionStatus(sessionId, 'abandoned');
      sessionIdRef.current = null;
    }
  };

  const resetTimer = () => {
    reset();
    setIsPlaying(false);
    SoundService.pauseBrownNoise();
    const sessionId = sessionIdRef.current;
    if (sessionId) {
      void ActivationService.updateSessionStatus(sessionId, 'abandoned');
      sessionIdRef.current = null;
    }
  };

  const toggleSound = () => {
    setIsPlaying((prev) => {
      if (prev) {
        SoundService.pauseBrownNoise();
      } else {
        SoundService.playBrownNoise();
      }

      return !prev;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerWrapper}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>IGNITE_PROTOCOL</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {isRunning ? 'RUNNING' : 'READY'}
              </Text>
            </View>
          </View>

          <View style={styles.rationaleCard}>
            <Text style={styles.rationaleTitle}>WHY THIS WORKS</Text>
            <Text style={styles.rationaleText}>
              Based on CBT/CADDI principles, the hardest part of ADHD is often starting. This 5-minute timer creates a low-commitment entry point to bypass procrastination and build behavioral activation momentum.
            </Text>
          </View>

          {isRestoring ? (
            <View style={styles.timerCard}>
              <ActivityIndicator
                size="small"
                color={Tokens.colors.brand[500]}
              />
              <Text style={styles.restoringText}>RESTORING...</Text>
            </View>
          ) : (
            <>
              <View style={styles.timerContainer}>
                <Text
                  style={styles.timer}
                  adjustsFontSizeToFit
                  numberOfLines={1}
                >
                  {formattedTime}
                </Text>
              </View>

              <View style={styles.controls}>
                {!isRunning ? (
                  <LinearButton
                    title="INITIATE_FOCUS"
                    onPress={startTimer}
                    size="lg"
                    style={styles.mainButton}
                  />
                ) : (
                  <LinearButton
                    title="PAUSE"
                    variant="secondary"
                    onPress={pauseTimer}
                    size="lg"
                    style={styles.mainButton}
                  />
                )}

                <View style={styles.secondaryControls}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.resetButton,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={resetTimer}
                  >
                    <Text style={styles.resetButtonText}>RESET</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      styles.soundButton,
                      isPlaying && styles.soundButtonActive,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={toggleSound}
                  >
                    <Text
                      style={[
                        styles.soundButtonText,
                        isPlaying && styles.textActive,
                      ]}
                    >
                      {isPlaying ? 'NOISE: ON' : 'NOISE: OFF'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral.darkest,
  },
  centerWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: Tokens.layout.maxWidth.prose,
    padding: Tokens.spacing[6],
    justifyContent: 'space-between', // Push header top, controls bottom
    paddingVertical: Tokens.spacing[8],
  },
  restoringText: {
    marginTop: Tokens.spacing[4],
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.sm,
    color: Tokens.colors.text.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  header: {
    alignItems: 'center',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: Tokens.colors.neutral.dark,
    paddingBottom: Tokens.spacing[4],
  },
  title: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.lg,
    fontWeight: '700',
    color: Tokens.colors.text.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Tokens.colors.neutral.darker,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.border,
  },
  statusText: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xxs,
    color: Tokens.colors.brand[500],
    letterSpacing: 1,
  },
  timerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  timerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: 140, // Massive
    fontWeight: '200', // Thin
    color: Tokens.colors.text.primary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -8,
    includeFontPadding: false,
  },
  controls: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    gap: Tokens.spacing[3],
  },
  mainButton: {
    width: '100%',
    borderRadius: 0,
    height: 56,
  },
  secondaryControls: {
    flexDirection: 'row',
    gap: Tokens.spacing[3],
  },
  resetButton: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.border,
    backgroundColor: 'transparent',
  },
  resetButtonText: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    color: Tokens.colors.text.secondary,
    letterSpacing: 1,
    fontWeight: '700',
  },
  soundButton: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.border,
    backgroundColor: Tokens.colors.neutral.darker,
  },
  soundButtonActive: {
    backgroundColor: Tokens.colors.neutral.dark,
    borderColor: Tokens.colors.brand[500],
  },
  soundButtonText: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    color: Tokens.colors.text.secondary,
    letterSpacing: 1,
    fontWeight: '700',
  },
  textActive: {
    color: Tokens.colors.text.primary,
  },
  buttonPressed: {
    opacity: 0.8,
    backgroundColor: Tokens.colors.neutral.dark,
  },
  rationaleCard: {
    backgroundColor: Tokens.colors.neutral.darker,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    padding: Tokens.spacing[4],
    marginTop: Tokens.spacing[4],
    marginBottom: Tokens.spacing[2],
  },
  rationaleTitle: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    fontWeight: '700',
    color: Tokens.colors.brand[500],
    letterSpacing: 1,
    marginBottom: Tokens.spacing[2],
    textTransform: 'uppercase',
  },
  rationaleText: {
    fontFamily: Tokens.type.fontFamily.body,
    fontSize: Tokens.type.sm,
    color: Tokens.colors.text.secondary,
    lineHeight: 22,
    flexWrap: 'wrap',
  },
});

export default IgniteScreen;

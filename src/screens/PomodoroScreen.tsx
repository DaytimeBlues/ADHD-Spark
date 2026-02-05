import React, { useEffect, useRef, useState, useReducer } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import SoundService from '../services/SoundService';
import StorageService from '../services/StorageService';
import { formatTime } from '../utils/helpers';
import { LinearButton } from '../components/ui/LinearButton';
import { Tokens } from '../theme/tokens';

type PomodoroState = {
  isWorking: boolean;
  timeLeft: number;
  sessions: number;
};

const PomodoroScreen = () => {
  const [isWorking, setIsWorking] = useState(true);
  const [timeLeft, setTimeLeft] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isWorkingRef = useRef(isWorking);

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
        setTimeLeft(storedState.timeLeft);
      }

      if (typeof storedState.sessions === 'number') {
        setSessions(storedState.sessions);
      }
    };

    loadState();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    StorageService.setJSON(StorageService.STORAGE_KEYS.pomodoroState, {
      isWorking,
      timeLeft,
      sessions,
    });
  }, [isWorking, timeLeft, sessions]);

  const startTimer = () => {
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (isWorkingRef.current) {
            setSessions(s => s + 1);
            setIsWorking(false);
            SoundService.playCompletionSound();
            return 300;
          } else {
            setIsWorking(true);
            SoundService.playNotificationSound();
            return 1500;
          }
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsWorking(true);
    setTimeLeft(1500);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Pomodoro</Text>
        <Text style={styles.subtitle}>
          {isWorking ? 'Focus Time' : 'Take a Break'}
        </Text>

        <View style={styles.sessionsContainer}>
          <Text style={styles.sessionsText}>
            Sessions completed: {sessions}
          </Text>
        </View>

        <View style={styles.timerContainer}>
          <View
            style={[
              styles.phaseIndicator,
              {
                backgroundColor: isWorking
                  ? Tokens.colors.error.main
                  : Tokens.colors.success.main,
              },
            ]}
          />
          <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
          <Text style={styles.phaseText}>
            {isWorking ? 'Focus' : 'Break'}
          </Text>
        </View>

        <View style={styles.controls}>
          {!isRunning ? (
            <LinearButton
              title="Start"
              onPress={startTimer}
              variant="primary"
              size="lg"
              style={styles.controlBtn}
            />
          ) : (
            <LinearButton
              title="Pause"
              onPress={pauseTimer}
              variant="secondary"
              size="lg"
              style={styles.controlBtn}
            />
          )}
          <LinearButton
            title="Reset"
            onPress={resetTimer}
            variant="ghost"
            size="lg"
            style={styles.controlBtn}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral.darkest,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: Tokens.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 680,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: '700',
    color: Tokens.colors.text.primary,
    marginBottom: Tokens.spacing[1],
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.base,
    color: Tokens.colors.text.secondary,
    marginBottom: Tokens.spacing[6],
  },
  sessionsContainer: {
    marginBottom: Tokens.spacing[8],
  },
  sessionsText: {
    fontFamily: 'Inter',
    color: Tokens.colors.indigo.primary,
    fontSize: Tokens.type.sm,
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: Tokens.spacing[12],
    justifyContent: 'center',
  },
  phaseIndicator: {
    width: 240,
    height: 240,
    borderRadius: Tokens.radii.full,
    position: 'absolute',
    opacity: 0.1,
  },
  timer: {
    fontFamily: 'Inter',
    fontSize: 84,
    fontWeight: '700',
    color: Tokens.colors.text.primary,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
    letterSpacing: -2,
  },
  phaseText: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.lg,
    color: Tokens.colors.text.tertiary,
    marginTop: Tokens.spacing[2],
  },
  controls: {
    flexDirection: 'row',
    gap: Tokens.spacing[3],
    marginTop: Tokens.spacing[8],
  },
  controlBtn: {
    minWidth: 120,
  },
});

export default PomodoroScreen;

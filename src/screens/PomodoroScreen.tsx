import React, {useEffect, useRef, useState} from 'react';
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
import {formatTime} from '../utils/helpers';
import {Tokens} from '../theme/tokens';

const PomodoroScreen = () => {
  const [isWorking, setIsWorking] = useState(true);
  const [timeLeft, setTimeLeft] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadState = async () => {
      const storedState = await StorageService.getJSON<{
        isWorking: boolean;
        timeLeft: number;
        sessions: number;
      }>(StorageService.STORAGE_KEYS.pomodoroState);

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
          if (isWorking) {
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
                  ? Tokens.colors.danger[500]
                  : Tokens.colors.success[500],
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
            <TouchableOpacity style={styles.primaryButton} onPress={startTimer}>
              <Text style={styles.primaryButtonText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryButton} onPress={pauseTimer}>
              <Text style={styles.primaryButtonText}>Pause</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.secondaryButton} onPress={resetTimer}>
            <Text style={styles.secondaryButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral[900],
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: Tokens.spacing[16],
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: Tokens.layout.maxWidth.prose,
  },
  title: {
    fontSize: Tokens.type['3xl'],
    fontWeight: 'bold',
    color: Tokens.colors.neutral[0],
    marginBottom: Tokens.spacing[4],
  },
  subtitle: {
    fontSize: Tokens.type.base,
    color: Tokens.colors.neutral[300],
    marginBottom: Tokens.spacing[16],
  },
  sessionsContainer: {
    marginBottom: Tokens.spacing[32],
  },
  sessionsText: {
    color: Tokens.colors.brand[500],
    fontSize: Tokens.type.base,
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: Tokens.spacing[48],
    justifyContent: 'center',
  },
  phaseIndicator: {
    width: 200,
    height: 200,
    borderRadius: Tokens.radii.pill,
    position: 'absolute',
    opacity: 0.2,
  },
  timer: {
    fontSize: Tokens.type.mega,
    fontWeight: 'bold',
    color: Tokens.colors.neutral[0],
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  phaseText: {
    fontSize: Tokens.type.lg,
    color: Tokens.colors.neutral[300],
    marginTop: Tokens.spacing[8],
  },
  controls: {
    flexDirection: 'row',
    gap: Tokens.spacing[16],
  },
  primaryButton: {
    backgroundColor: Tokens.colors.danger[500],
    paddingHorizontal: Tokens.spacing[48],
    paddingVertical: Tokens.spacing[16],
    borderRadius: Tokens.radii.pill,
    minHeight: Tokens.layout.minTapTarget,
    justifyContent: 'center',
    alignItems: 'center',
    ...Tokens.elevation.sm,
  },
  primaryButtonText: {
    color: Tokens.colors.neutral[0],
    fontSize: Tokens.type.lg,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: Tokens.colors.neutral[700],
    paddingHorizontal: Tokens.spacing[24],
    paddingVertical: Tokens.spacing[16],
    borderRadius: Tokens.radii.pill,
    minHeight: Tokens.layout.minTapTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Tokens.colors.neutral[0],
    fontSize: Tokens.type.lg,
    fontWeight: '600',
  },
});

export default PomodoroScreen;

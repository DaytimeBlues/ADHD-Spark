import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import SoundService from '../services/SoundService';
import StorageService from '../services/StorageService';
import {formatTime} from '../utils/helpers';
import {Tokens} from '../theme/tokens';

const IgniteScreen = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    SoundService.initBrownNoise();

    const loadState = async () => {
      const storedState = await StorageService.getJSON<{
        timeLeft: number;
        isPlaying: boolean;
      }>(StorageService.STORAGE_KEYS.igniteState);
      if (!storedState) {
        return;
      }

      if (typeof storedState.timeLeft === 'number') {
        setTimeLeft(storedState.timeLeft);
      }

      if (storedState.isPlaying) {
        setIsPlaying(true);
        SoundService.playBrownNoise();
      }
    };

    loadState();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      SoundService.stopBrownNoise();
      SoundService.releaseBrownNoise();
    };
  }, []);

  useEffect(() => {
    StorageService.setJSON(StorageService.STORAGE_KEYS.igniteState, {
      timeLeft,
      isPlaying,
    });
  }, [timeLeft, isPlaying]);

  const startTimer = () => {
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          SoundService.playCompletionSound();
          return 0;
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
    setTimeLeft(300);
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    SoundService.pauseBrownNoise();
  };

  const toggleSound = () => {
    setIsPlaying(prev => {
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
      <View style={styles.content}>
        <Text style={styles.title}>Ignite</Text>
        <Text style={styles.subtitle}>5-Minute Focus Timer</Text>

        <View style={styles.timerContainer}>
          <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
          <Text style={styles.status}>
            {isRunning ? 'Focusing...' : 'Ready to start'}
          </Text>
        </View>

        <View style={styles.controls}>
          {!isRunning ? (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={startTimer}>
              <Text style={styles.primaryButtonText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={pauseTimer}>
              <Text style={styles.dangerButtonText}>Pause</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.outlineButton]}
            onPress={resetTimer}>
            <Text style={styles.outlineButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.soundButton,
            isPlaying ? styles.soundButtonActive : styles.soundButtonInactive,
          ]}
          onPress={toggleSound}>
          <Text
            style={
              isPlaying
                ? styles.soundButtonTextActive
                : styles.soundButtonTextInactive
            }>
            {isPlaying ? '🔊 Brown Noise On' : '🔇 Brown Noise Off'}
          </Text>
        </TouchableOpacity>
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
    padding: Tokens.spacing[24],
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: Tokens.layout.maxWidth.prose,
  },
  title: {
    fontSize: Tokens.type['5xl'],
    fontWeight: '300',
    color: Tokens.colors.neutral[0],
    marginBottom: Tokens.spacing[4],
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: Tokens.type.xl,
    color: Tokens.colors.neutral[300],
    marginBottom: Tokens.spacing[48],
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: Tokens.spacing[48],
  },
  timer: {
    fontSize: Tokens.type.giga,
    fontWeight: '300',
    color: Tokens.colors.neutral[0],
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
    textAlign: 'center',
  },
  status: {
    fontSize: Tokens.type.xl,
    color: Tokens.colors.brand[400],
    marginTop: Tokens.spacing[16],
  },
  controls: {
    flexDirection: 'row',
    marginBottom: Tokens.spacing[32],
    justifyContent: 'center',
    gap: Tokens.spacing[16],
    flexWrap: 'wrap',
  },
  button: {
    paddingHorizontal: Tokens.spacing[32],
    paddingVertical: Tokens.spacing[16],
    borderRadius: Tokens.radii.pill,
    minHeight: Tokens.layout.minTapTarget,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
    ...Tokens.elevation.sm,
  },
  primaryButton: {
    backgroundColor: Tokens.colors.brand[500],
  },
  primaryButtonText: {
    color: Tokens.colors.neutral[0],
    fontSize: Tokens.type.lg,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: Tokens.colors.danger[500],
  },
  dangerButtonText: {
    color: Tokens.colors.neutral[0],
    fontSize: Tokens.type.lg,
    fontWeight: '600',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Tokens.colors.neutral[500],
    elevation: 0, // override elevation for outline
    shadowOpacity: 0,
  },
  outlineButtonText: {
    color: Tokens.colors.neutral[200],
    fontSize: Tokens.type.lg,
    fontWeight: '600',
  },
  soundButton: {
    minWidth: 220,
    paddingHorizontal: Tokens.spacing[24],
    paddingVertical: Tokens.spacing[16],
    borderRadius: Tokens.radii.pill,
    borderWidth: 1,
    minHeight: Tokens.layout.minTapTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  soundButtonActive: {
    backgroundColor: Tokens.colors.brand[600],
    borderColor: Tokens.colors.brand[600],
    ...Tokens.elevation.sm,
  },
  soundButtonInactive: {
    backgroundColor: 'transparent',
    borderColor: Tokens.colors.brand[400],
  },
  soundButtonTextActive: {
    color: Tokens.colors.neutral[0],
    fontSize: Tokens.type.base,
    fontWeight: '600',
  },
  soundButtonTextInactive: {
    color: Tokens.colors.brand[300],
    fontSize: Tokens.type.base,
    fontWeight: '600',
  },
});

export default IgniteScreen;

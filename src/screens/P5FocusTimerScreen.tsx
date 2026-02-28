/**
 * P5FocusTimerScreen - Persona 5 Style Focus Timer
 * 
 * Dramatic timer interface with theatrical completion animations.
 * Supports focus sessions with progress visualization.
 * 
 * @example
 * <P5FocusTimerScreen />
 */

import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Vibration,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import {
  P5Screen,
  P5Header,
  P5Button,
  P5Card,
} from '../ui/p5';
import {
  P5Colors,
  P5SemanticColors,
  P5Spacing,
  P5Typography,
  P5FontSizes,
  P5Motion,
} from '../theme/p5Tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TIMER_DURATION = 25 * 60; // 25 minutes in seconds
const PROGRESS_RING_SIZE = 240;
const STROKE_WIDTH = 8;

export const P5FocusTimerScreen = memo(function P5FocusTimerScreen() {
  const insets = useSafeAreaInsets();
  
  // State
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [sessions, setSessions] = useState(0);
  
  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animation values
  const progress = useSharedValue(0);
  const timerScale = useSharedValue(1);
  const victoryScale = useSharedValue(0);
  const ringOpacity = useSharedValue(1);
  const flashOpacity = useSharedValue(0);
  
  // Start timer
  const startTimer = useCallback(() => {
    if (isRunning) return;
    
    setIsRunning(true);
    timerScale.value = withSpring(1.02, { stiffness: 100, damping: 10 });
    
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Timer complete
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          setIsRunning(false);
          setIsComplete(true);
          setSessions((s) => s + 1);
          
          // Haptic feedback
          Vibration.vibrate([0, 200, 100, 200, 100, 200]);
          
          // Victory animation
          progress.value = withTiming(1, { duration: 200 });
          victoryScale.value = withDelay(
            200,
            withSequence(
              withTiming(1.3, { duration: 200, easing: Easing.out(Easing.back(1.5)) }),
              withSpring(1, { stiffness: 100, damping: 8 })
            )
          );
          flashOpacity.value = withSequence(
            withTiming(1, { duration: 50 }),
            withTiming(0, { duration: 400 })
          );
          
          return 0;
        }
        
        // Update progress
        const newProgress = 1 - (prev - 1) / TIMER_DURATION;
        progress.value = withTiming(newProgress, { duration: 100 });
        
        return prev - 1;
      });
    }, 1000);
  }, [isRunning, progress, timerScale, victoryScale, flashOpacity]);
  
  // Pause timer
  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRunning(false);
    timerScale.value = withSpring(1, { stiffness: 100, damping: 10 });
  }, [timerScale]);
  
  // Reset timer
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRunning(false);
    setTimeRemaining(TIMER_DURATION);
    setIsComplete(false);
    progress.value = withTiming(0, { duration: 300 });
    victoryScale.value = 0;
    flashOpacity.value = 0;
  }, [progress, victoryScale, flashOpacity]);
  
  // Extend time
  const extendTime = useCallback(() => {
    setTimeRemaining((prev) => prev + 5 * 60); // Add 5 minutes
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Animated styles
  const animatedTimerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: timerScale.value }],
  }));
  
  const animatedVictoryStyle = useAnimatedStyle(() => ({
    transform: [{ scale: victoryScale.value }],
    opacity: victoryScale.value,
  }));
  
  const animatedFlashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));
  
  // Calculate stroke dash offset for progress ring
  const circumference = (PROGRESS_RING_SIZE - STROKE_WIDTH) * Math.PI;
  const strokeDashOffset = progress.value * circumference;
  
  return (
    <P5Screen>
      <P5Header 
        title="FOCUS" 
        subtitle="CONCENTRATION"
        showBack 
        onBack={() => {}}
      />
      
      {/* Flash overlay for completion */}
      <Animated.View style={[styles.flashOverlay, animatedFlashStyle]} pointerEvents="none" />
      
      <View style={styles.container}>
        {/* Timer Display */}
        <Animated.View style={[styles.timerContainer, animatedTimerStyle]}>
          {/* Progress Ring */}
          <View style={styles.progressRing}>
            <View style={styles.progressRingBackground} />
            <View 
              style={[
                styles.progressRingFill,
                {
                  transform: [{ rotate: `${progress.value * 360}deg` }],
                },
              ]} 
            />
            {/* Quarter markers */}
            {[0, 90, 180, 270].map((angle, i) => (
              <View
                key={i}
                style={[
                  styles.quarterMarker,
                  { transform: [{ rotate: `${angle}deg` }] },
                ]}
              />
            ))}
          </View>
          
          {/* Time Display */}
          <View style={styles.timeDisplay}>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
            <Text style={styles.timerLabel}>
              {isComplete ? 'COMPLETE!' : isRunning ? 'FOCUSING...' : 'READY'}
            </Text>
          </View>
        </Animated.View>
        
        {/* Victory Text */}
        <Animated.View style={[styles.victoryContainer, animatedVictoryStyle]}>
          <Text style={styles.victoryText}>VICTORY!</Text>
          <Text style={styles.victorySubtext}>Mission Accomplished</Text>
        </Animated.View>
        
        {/* Session Counter */}
        <View style={styles.sessionCounter}>
          <Text style={styles.sessionLabel}>SESSIONS TODAY</Text>
          <View style={styles.sessionDots}>
            {Array.from({ length: Math.min(sessions, 8) }).map((_, i) => (
              <View key={i} style={styles.sessionDot} />
            ))}
          </View>
          <Text style={styles.sessionCount}>{sessions}</Text>
        </View>
        
        {/* Controls */}
        <View style={styles.controls}>
          {isRunning ? (
            <P5Button
              variant="secondary"
              size="lg"
              onPress={pauseTimer}
              style={styles.controlButton}
            >
              ⏸ PAUSE
            </P5Button>
          ) : (
            <P5Button
              variant="primary"
              size="lg"
              onPress={startTimer}
              style={styles.controlButton}
            >
              {isComplete ? '▶ AGAIN' : timeRemaining < TIMER_DURATION ? '▶ RESUME' : '▶ START'}
            </P5Button>
          )}
          
          <View style={styles.secondaryControls}>
            <P5Button
              variant="ghost"
              size="md"
              onPress={extendTime}
              disabled={!isRunning}
              style={styles.secondaryButton}
            >
              +5 MIN
            </P5Button>
            
            <P5Button
              variant="ghost"
              size="md"
              onPress={resetTimer}
              style={styles.secondaryButton}
            >
              ↺ RESET
            </P5Button>
          </View>
        </View>
        
        {/* Stats */}
        <P5Card accentPosition="none" intensity="subtle" style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>25</Text>
              <Text style={styles.statLabel}>MINUTES</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>MIN BREAK</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4</Text>
              <Text style={styles.statLabel}>CYCLES</Text>
            </View>
          </View>
        </P5Card>
      </View>
    </P5Screen>
  );
});

const styles = StyleSheet.create({
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: P5Colors.text,
    zIndex: 100,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: P5Spacing.lg,
  },
  timerContainer: {
    width: PROGRESS_RING_SIZE,
    height: PROGRESS_RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
    width: PROGRESS_RING_SIZE,
    height: PROGRESS_RING_SIZE,
    borderWidth: STROKE_WIDTH,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressRingBackground: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: STROKE_WIDTH,
    borderColor: 'transparent',
    borderRadius: 0,
  },
  progressRingFill: {
    position: 'absolute',
    top: -STROKE_WIDTH,
    left: -STROKE_WIDTH,
    right: -STROKE_WIDTH,
    bottom: -STROKE_WIDTH,
    borderWidth: STROKE_WIDTH,
    borderColor: P5Colors.primary,
    borderRadius: 0,
  },
  quarterMarker: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 3,
    height: 12,
    backgroundColor: P5Colors.stroke,
    marginLeft: -1.5,
  },
  timeDisplay: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: P5FontSizes.display1,
    fontWeight: '900',
    fontFamily: P5Typography.display.fontFamily,
    color: P5Colors.text,
    letterSpacing: -2,
  },
  timerLabel: {
    fontSize: P5FontSizes.caption,
    fontWeight: '700',
    color: P5Colors.primary,
    letterSpacing: 2,
    marginTop: P5Spacing.xs,
  },
  victoryContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  victoryText: {
    fontSize: 48,
    fontWeight: '900',
    fontFamily: P5Typography.graffiti.fontFamily,
    color: P5Colors.primary,
    textShadowColor: P5Colors.primary,
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
  },
  victorySubtext: {
    fontSize: P5FontSizes.body,
    fontWeight: '600',
    color: P5Colors.text,
    marginTop: P5Spacing.xs,
  },
  sessionCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: P5Spacing.xl,
  },
  sessionLabel: {
    fontSize: P5FontSizes.caption,
    fontWeight: '700',
    color: P5Colors.textMuted,
    letterSpacing: 1,
    marginRight: P5Spacing.sm,
  },
  sessionDots: {
    flexDirection: 'row',
    marginRight: P5Spacing.sm,
  },
  sessionDot: {
    width: 8,
    height: 8,
    backgroundColor: P5Colors.primary,
    marginHorizontal: 2,
    transform: [{ skewX: '-10deg' }],
  },
  sessionCount: {
    fontSize: P5FontSizes.heading1,
    fontWeight: '900',
    color: P5Colors.text,
  },
  controls: {
    marginTop: P5Spacing.xxl,
    alignItems: 'center',
    width: '100%',
  },
  controlButton: {
    width: '100%',
    maxWidth: 280,
  },
  secondaryControls: {
    flexDirection: 'row',
    marginTop: P5Spacing.md,
    justifyContent: 'center',
  },
  secondaryButton: {
    marginHorizontal: P5Spacing.sm,
  },
  statsCard: {
    marginTop: P5Spacing.xl,
    padding: P5Spacing.md,
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: P5FontSizes.heading1,
    fontWeight: '900',
    color: P5Colors.text,
  },
  statLabel: {
    fontSize: P5FontSizes.caption,
    fontWeight: '600',
    color: P5Colors.textMuted,
    letterSpacing: 1,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: P5SemanticColors.borderDefault,
  },
});

export default P5FocusTimerScreen;

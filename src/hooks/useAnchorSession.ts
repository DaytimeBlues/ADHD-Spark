import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutAnimation, UIManager } from 'react-native';
import useTimer from './useTimer';
import { isAndroid } from '../utils/PlatformUtils';

export type BreathingPattern = '478' | 'box' | 'energize';
export type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'wait';

export interface PatternConfig {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  wait: number;
}

export const PATTERNS: Record<BreathingPattern, PatternConfig> = {
  '478': { name: '4-7-8 RELAX', inhale: 4, hold: 7, exhale: 8, wait: 0 },
  box: { name: 'BOX BREATHING', inhale: 4, hold: 4, exhale: 4, wait: 4 },
  energize: { name: 'ENERGIZE', inhale: 6, hold: 0, exhale: 2, wait: 0 },
};

const enableAndroidLayoutAnimation = () => {
  if (isAndroid && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
};

const getNextPhase = (
  currentPhase: BreathingPhase,
  patternConfig: PatternConfig,
): BreathingPhase => {
  const phases: Record<BreathingPhase, BreathingPhase> = {
    inhale: patternConfig.hold > 0 ? 'hold' : 'exhale',
    hold: 'exhale',
    exhale: patternConfig.wait > 0 ? 'wait' : 'inhale',
    wait: 'inhale',
  };

  return phases[currentPhase];
};

const getPhaseDuration = (
  patternConfig: PatternConfig,
  phase: BreathingPhase,
): number => {
  return patternConfig[phase] || patternConfig.inhale;
};

interface UseAnchorSessionReturn {
  pattern: BreathingPattern | null;
  phase: BreathingPhase;
  count: number;
  isActive: boolean;
  startPattern: (selectedPattern: BreathingPattern) => void;
  stopPattern: () => void;
  getPhaseText: () => string;
  getCircleScale: () => number;
}

export const useAnchorSession = (): UseAnchorSessionReturn => {
  const [pattern, setPattern] = useState<BreathingPattern | null>(null);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const patternRef = useRef<BreathingPattern | null>(null);
  const phaseRef = useRef<BreathingPhase>('inhale');
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    timeLeft: count,
    start,
    reset,
    setTime,
  } = useTimer({
    id: 'anchor',
    initialTime: PATTERNS['478'].inhale,
    onComplete: () => {
      if (!patternRef.current) {
        return;
      }

      const patternConfig = PATTERNS[patternRef.current];
      const nextPhase = getNextPhase(phaseRef.current, patternConfig);

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setPhase(nextPhase);
      phaseRef.current = nextPhase;
      setTime(getPhaseDuration(patternConfig, nextPhase));
      restartTimeoutRef.current = setTimeout(() => start(), 0);
    },
  });

  useEffect(() => {
    patternRef.current = pattern;
  }, [pattern]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    enableAndroidLayoutAnimation();
  }, []);

  useEffect(() => {
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, []);

  const startPattern = useCallback(
    (selectedPattern: BreathingPattern) => {
      const initialDuration = PATTERNS[selectedPattern].inhale;
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setPattern(selectedPattern);
      patternRef.current = selectedPattern;
      setPhase('inhale');
      phaseRef.current = 'inhale';
      start(initialDuration);
    },
    [start],
  );

  const stopPattern = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    reset();
    setPattern(null);
    patternRef.current = null;
  }, [reset]);

  const getPhaseText = useCallback(() => {
    switch (phase) {
      case 'inhale':
        return 'BREATHE IN';
      case 'hold':
        return 'HOLD';
      case 'exhale':
        return 'BREATHE OUT';
      case 'wait':
        return 'REST';
      default:
        return '';
    }
  }, [phase]);

  const getCircleScale = useCallback(() => {
    switch (phase) {
      case 'inhale':
      case 'hold':
        return 1.5;
      case 'exhale':
      case 'wait':
      default:
        return 1;
    }
  }, [phase]);

  return {
    pattern,
    phase,
    count,
    isActive: pattern !== null,
    startPattern,
    stopPattern,
    getPhaseText,
    getCircleScale,
  };
};

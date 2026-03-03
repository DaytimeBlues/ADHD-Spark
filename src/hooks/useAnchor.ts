import { useState, useEffect, useRef, useCallback } from "react";
import { LayoutAnimation, Platform, UIManager } from "react-native";
import useTimer from "./useTimer";

export type BreathingPattern = "478" | "box" | "energize";

export interface PatternConfig {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  wait: number;
}

export const PATTERNS: Record<BreathingPattern, PatternConfig> = {
  "478": { name: "4-7-8 RELAX", inhale: 4, hold: 7, exhale: 8, wait: 0 },
  box: { name: "BOX BREATHING", inhale: 4, hold: 4, exhale: 4, wait: 4 },
  energize: { name: "ENERGIZE", inhale: 6, hold: 0, exhale: 2, wait: 0 },
};

export type BreathingPhase = "inhale" | "hold" | "exhale" | "wait";

interface UseAnchorReturn {
  // State
  pattern: BreathingPattern | null;
  phase: BreathingPhase;
  count: number;
  isActive: boolean;

  // Actions
  startPattern: (selectedPattern: BreathingPattern) => void;
  stopPattern: () => void;
  getPhaseText: () => string;
  getCircleScale: () => number;
}

export const useAnchor = (): UseAnchorReturn => {
  const [pattern, setPattern] = useState<BreathingPattern | null>(null);
  const [phase, setPhase] = useState<BreathingPhase>("inhale");
  const phaseRef = useRef<BreathingPhase>("inhale");
  const patternRef = useRef<BreathingPattern | null>(null);
  const phaseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    timeLeft: count,
    start,
    reset,
    setTime,
  } = useTimer({
    id: "anchor",
    initialTime: 4,
    onComplete: () => {
      if (!patternRef.current) {
        return;
      }
      const p = PATTERNS[patternRef.current];
      const phases: Record<BreathingPhase, BreathingPhase> = {
        inhale: p.hold > 0 ? "hold" : "exhale",
        hold: "exhale",
        exhale: p.wait > 0 ? "wait" : "inhale",
        wait: "inhale",
      };
      const currentPhase = phaseRef.current;
      const nextPhase = phases[currentPhase];

      // Animate transition on native
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setPhase(nextPhase);
      phaseRef.current = nextPhase;
      setTime(p[nextPhase] || p.inhale);
      // Re-start for the next phase
      phaseTimeoutRef.current = setTimeout(() => start(), 0);
    },
  });

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    patternRef.current = pattern;
  }, [pattern]);

  // Initialize layout animation on Android
  useEffect(() => {
    if (Platform.OS === "android") {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
  }, []);

  const startPattern = useCallback(
    (selectedPattern: BreathingPattern) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setPattern(selectedPattern);
      patternRef.current = selectedPattern;
      setPhase("inhale");
      phaseRef.current = "inhale";
      setTime(PATTERNS[selectedPattern].inhale);
      start();
    },
    [setTime, start],
  );

  const stopPattern = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    reset();
    setPattern(null);
    patternRef.current = null;
    // Clear pending phase transition timeout
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
  }, [reset]);

  const getPhaseText = useCallback(() => {
    switch (phase) {
      case "inhale":
        return "BREATHE IN";
      case "hold":
        return "HOLD";
      case "exhale":
        return "BREATHE OUT";
      case "wait":
        return "REST";
      default:
        return "";
    }
  }, [phase]);

  const getCircleScale = useCallback(() => {
    switch (phase) {
      case "inhale":
        return 1.5;
      case "hold":
        return 1.5;
      case "exhale":
        return 1;
      case "wait":
        return 1;
      default:
        return 1;
    }
  }, [phase]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (phaseTimeoutRef.current) {
        clearTimeout(phaseTimeoutRef.current);
      }
    };
  }, []);

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

export default useAnchor;

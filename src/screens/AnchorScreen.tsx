import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Screen from "../components/ui/Screen";
import ScreenHeader from "../components/ui/ScreenHeader";
import Card from "../components/ui/Card";
import AppText from "../components/ui/AppText";
import Button from "../components/ui/Button";
import { colors, spacing, radius } from "../theme";

type BreathingPattern = "478" | "box" | "energize";

const AnchorScreen = () => {
  const [pattern, setPattern] = useState<BreathingPattern | null>(null);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "wait">(
    "inhale"
  );
  const [count, setCount] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const patterns: Record<
    BreathingPattern,
    { name: string; inhale: number; hold: number; exhale: number; wait: number }
  > = {
    "478": { name: "4-7-8 Relax", inhale: 4, hold: 7, exhale: 8, wait: 0 },
    box: { name: "Box Breathing", inhale: 4, hold: 4, exhale: 4, wait: 4 },
    energize: { name: "Energize", inhale: 6, hold: 0, exhale: 2, wait: 0 },
  };

  useEffect(() => {
    if (isActive && pattern) {
      const p = patterns[pattern];
      intervalRef.current = setInterval(() => {
        setCount((prev) => {
          if (prev <= 1) {
            const phases: Record<string, string> = {
              inhale: p.hold > 0 ? "hold" : "exhale",
              hold: "exhale",
              exhale: p.wait > 0 ? "wait" : "inhale",
              wait: "inhale",
            };
            setPhase(phases[phase] as any);
            return p[phases[phase] as keyof typeof p] || p.inhale;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, pattern, phase]);

  const startPattern = (selectedPattern: BreathingPattern) => {
    setPattern(selectedPattern);
    setPhase("inhale");
    setCount(patterns[selectedPattern].inhale);
    setIsActive(true);
  };

  const stopPattern = () => {
    setIsActive(false);
    setPattern(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const getPhaseText = () => {
    switch (phase) {
      case "inhale":
        return "Breathe In";
      case "hold":
        return "Hold";
      case "exhale":
        return "Breathe Out";
      case "wait":
        return "Rest";
      default:
        return "";
    }
  };

  const getCircleScale = () => {
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
  };

  return (
    <Screen style={styles.container}>
      <ScreenHeader title="Anchor" subtitle="Breathing exercises" />

      <View style={styles.centerContent}>
        {pattern ? (
          <View style={styles.activeContainer}>
            <AppText variant="sectionTitle" style={styles.patternName}>
              {patterns[pattern].name}
            </AppText>
            <View style={styles.breathingCircle}>
              <View
                style={[
                  styles.circle,
                  { transform: [{ scale: getCircleScale() }] },
                ]}
              />
              <AppText variant="sectionTitle" style={styles.phaseText}>
                {getPhaseText()}
              </AppText>
              <AppText variant="timer" style={styles.countText}>
                {count}
              </AppText>
            </View>
            <Button
              label="Stop"
              variant="danger"
              onPress={stopPattern}
              style={styles.stopButton}
            />
          </View>
        ) : (
          <View style={styles.patternsContainer}>
            {(Object.keys(patterns) as BreathingPattern[]).map((p) => (
              <TouchableOpacity
                key={p}
                activeOpacity={0.7}
                onPress={() => startPattern(p)}
              >
                <Card style={styles.patternCard}>
                  <AppText variant="sectionTitle" style={styles.patternTitle}>
                    {patterns[p].name}
                  </AppText>
                  <AppText variant="smallMuted">
                    {patterns[p].inhale}-
                    {patterns[p].hold > 0 ? patterns[p].hold + "-" : ""}
                    {patterns[p].exhale}
                    {patterns[p].wait > 0 ? "-" + patterns[p].wait : ""}
                  </AppText>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "flex-start",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  activeContainer: {
    alignItems: "center",
    width: "100%",
  },
  patternName: {
    color: colors.accent,
    marginBottom: spacing[32],
  },
  breathingCircle: {
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[48],
  },
  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.accent,
    opacity: 0.2, // Subtle background circle
    position: "absolute",
  },
  phaseText: {
    marginBottom: spacing[8],
  },
  countText: {
    fontSize: 64,
  },
  stopButton: {
    width: "60%",
  },
  patternsContainer: {
    width: "100%",
  },
  patternCard: {
    alignItems: "center",
    paddingVertical: spacing[24],
    borderWidth: 1,
    borderColor: colors.border,
  },
  patternTitle: {
    marginBottom: spacing[4],
  },
});

export default AnchorScreen;

import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import Screen from "../components/ui/Screen";
import ScreenHeader from "../components/ui/ScreenHeader";
import AppText from "../components/ui/AppText";
import Button from "../components/ui/Button";
import { colors, spacing } from "../theme";

const PomodoroScreen = () => {
  const [isWorking, setIsWorking] = useState(true);
  const [timeLeft, setTimeLeft] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startTimer = () => {
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (isWorking) {
            setSessions((s) => s + 1);
            setIsWorking(false);
            return 300;
          } else {
            setIsWorking(true);
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
    <Screen style={styles.container}>
      <ScreenHeader
        title="Pomodoro"
        subtitle={isWorking ? "Focus Time" : "Take a Break"}
      />

      <View style={styles.topInfo}>
        <AppText variant="sectionTitle" style={styles.sessionsText}>
          Sessions completed: {sessions}
        </AppText>
      </View>

      <View style={styles.timerWrapper}>
        <View
          style={[
            styles.phaseIndicator,
            { backgroundColor: isWorking ? colors.danger : "#4CAF50" },
          ]}
        />
        <AppText variant="timer" style={styles.timerText}>
          {formatTime(timeLeft)}
        </AppText>
        <AppText variant="sectionTitle" style={styles.phaseLabel}>
          {isWorking ? "Focus" : "Break"}
        </AppText>
      </View>

      <View style={styles.bottomControls}>
        <View style={styles.mainActions}>
          {!isRunning ? (
            <Button
              label="Start"
              onPress={startTimer}
              style={styles.actionButton}
            />
          ) : (
            <Button
              label="Pause"
              variant="danger"
              onPress={pauseTimer}
              style={styles.actionButton}
            />
          )}
          <Button
            label="Reset"
            variant="secondary"
            onPress={resetTimer}
            style={styles.resetButton}
          />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
  },
  topInfo: {
    alignItems: "center",
    marginTop: -spacing[16],
    marginBottom: spacing[24],
  },
  sessionsText: {
    color: colors.accent,
    fontSize: 16,
  },
  timerWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -spacing[48],
  },
  phaseIndicator: {
    width: 240,
    height: 240,
    borderRadius: 120,
    position: "absolute",
    opacity: 0.15,
  },
  timerText: {
    fontSize: 80,
    marginBottom: spacing[12],
  },
  phaseLabel: {
    color: colors.textMuted,
    fontSize: 20,
  },
  bottomControls: {
    marginBottom: spacing[16],
  },
  mainActions: {
    flexDirection: "row",
    marginBottom: spacing[8],
  },
  actionButton: {
    flex: 2,
    marginRight: spacing[12],
  },
  resetButton: {
    flex: 1,
  },
});

export default PomodoroScreen;

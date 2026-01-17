import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet } from "react-native";
import Screen from "../components/ui/Screen";
import ScreenHeader from "../components/ui/ScreenHeader";
import AppText from "../components/ui/AppText";
import Button from "../components/ui/Button";
import { colors, spacing } from "../theme";

const IgniteScreen = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isPlaying, setIsPlaying] = useState(false);
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
          setIsRunning(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
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
  };

  const toggleSound = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <Screen style={styles.container}>
      <ScreenHeader title="Ignite" subtitle="5-Minute Focus Timer" />

      <View style={styles.timerWrapper}>
        <AppText variant="timer" style={styles.timerText}>
          {formatTime(timeLeft)}
        </AppText>
        <AppText
          style={[
            styles.statusText,
            { color: isRunning ? colors.accent : colors.textMuted },
          ]}
        >
          {isRunning ? "Focusing..." : "Ready to start"}
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

        <Button
          label={isPlaying ? "🔊 Brown Noise On" : "🔇 Brown Noise Off"}
          variant={isPlaying ? "primary" : "ghost"}
          size="md"
          onPress={toggleSound}
          style={styles.soundButton}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
  },
  timerWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -spacing[48], // Offset header
  },
  timerText: {
    fontSize: 80,
    marginBottom: spacing[12],
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
  },
  bottomControls: {
    marginBottom: spacing[16],
  },
  mainActions: {
    flexDirection: "row",
    marginBottom: spacing[24],
  },
  actionButton: {
    flex: 2,
    marginRight: spacing[12],
  },
  resetButton: {
    flex: 1,
  },
  soundButton: {
    alignSelf: "center",
    width: "100%",
  },
});

export default IgniteScreen;

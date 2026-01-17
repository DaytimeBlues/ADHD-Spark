import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Screen from "../components/ui/Screen";
import ScreenHeader from "../components/ui/ScreenHeader";
import Card from "../components/ui/Card";
import AppText from "../components/ui/AppText";
import { colors, spacing, radius } from "../theme";

const CheckInScreen = () => {
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);

  const moods = [
    { emoji: "😢", label: "Low", value: 1 },
    { emoji: "😕", label: "Down", value: 2 },
    { emoji: "😐", label: "Neutral", value: 3 },
    { emoji: "🙂", label: "Good", value: 4 },
    { emoji: "😊", label: "Great", value: 5 },
  ];

  const energyLevels = [
    { emoji: "🔋", label: "Drained", value: 1 },
    { emoji: "🔋", label: "Low", value: 2 },
    { emoji: "🔋", label: "Medium", value: 3 },
    { emoji: "🔋", label: "High", value: 4 },
    { emoji: "🔋", label: "Full", value: 5 },
  ];

  const getRecommendation = () => {
    if (mood === null || energy === null) return null;
    if (mood <= 2 && energy <= 2) {
      return {
        title: "🌱 Gentle Start",
        desc: "Try the Anchor breathing exercise to ground yourself.",
      };
    }
    if (mood >= 4 && energy >= 4) {
      return {
        title: "🚀 Ride the Wave",
        desc: "Perfect time for a Ignite focus session!",
      };
    }
    if (energy <= 2) {
      return {
        title: "💪 Micro Task",
        desc: "Try Fog Cutter with just one micro-step.",
      };
    }
    return { title: "📝 Brain Dump", desc: "Clear your mind before starting." };
  };

  const recommendation = getRecommendation();

  return (
    <Screen scroll>
      <ScreenHeader title="Check In" subtitle="How are you feeling?" />

      <Card style={styles.sectionCard}>
        <AppText variant="sectionTitle" style={styles.sectionTitle}>
          Mood
        </AppText>
        <View style={styles.options}>
          {moods.map((m) => (
            <TouchableOpacity
              key={m.value}
              activeOpacity={0.7}
              style={[styles.option, mood === m.value && styles.selected]}
              onPress={() => setMood(m.value)}
            >
              <AppText style={styles.emoji}>{m.emoji}</AppText>
              <AppText
                variant="smallMuted"
                style={[styles.label, mood === m.value && styles.selectedLabel]}
              >
                {m.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <AppText variant="sectionTitle" style={styles.sectionTitle}>
          Energy
        </AppText>
        <View style={styles.options}>
          {energyLevels.map((e) => (
            <TouchableOpacity
              key={e.value}
              activeOpacity={0.7}
              style={[styles.option, energy === e.value && styles.selected]}
              onPress={() => setEnergy(e.value)}
            >
              <AppText style={styles.emoji}>{e.emoji}</AppText>
              <AppText
                variant="smallMuted"
                style={[
                  styles.label,
                  energy === e.value && styles.selectedLabel,
                ]}
              >
                {e.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {recommendation && (
        <Card style={styles.recommendationBox}>
          <AppText variant="sectionTitle" style={styles.recommendationTitle}>
            {recommendation.title}
          </AppText>
          <AppText style={styles.recommendationText}>
            {recommendation.desc}
          </AppText>
        </Card>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    padding: spacing[16],
    marginBottom: spacing[24],
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    marginBottom: spacing[16],
  },
  options: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  option: {
    alignItems: "center",
    paddingVertical: spacing[12],
    borderRadius: radius.input,
    backgroundColor: colors.background,
    width: "18%",
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  emoji: {
    fontSize: 24,
    marginBottom: spacing[4],
  },
  label: {
    fontSize: 10,
  },
  selectedLabel: {
    color: colors.text,
  },
  recommendationBox: {
    backgroundColor: colors.surface2,
    padding: spacing[20],
    borderWidth: 1,
    borderColor: colors.accent,
  },
  recommendationTitle: {
    color: colors.accent,
    marginBottom: spacing[8],
  },
  recommendationText: {
    lineHeight: 24,
  },
});

export default CheckInScreen;

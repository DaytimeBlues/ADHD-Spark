import React from "react";
import { View, StyleSheet, TouchableOpacity, Linking } from "react-native";
import Screen from "../components/ui/Screen";
import ScreenHeader from "../components/ui/ScreenHeader";
import Card from "../components/ui/Card";
import AppText from "../components/ui/AppText";
import { colors, spacing, radius } from "../theme";

const CrisisScreen = () => {
  const crisisLines = [
    {
      name: "National Suicide Prevention Lifeline",
      number: "988",
      url: "tel:988",
    },
    {
      name: "Crisis Text Line",
      number: "Text HOME to 741741",
      url: "sms:741741",
    },
    {
      name: "SAMHSA National Helpline",
      number: "1-800-662-4357",
      url: "tel:18006624357",
    },
  ];

  const copingStrategies = [
    {
      emoji: "🌊",
      title: "Ride the Wave",
      desc: "Emotions pass like waves. This too shall pass.",
    },
    {
      emoji: "👁️",
      title: "5-4-3-2-1 Grounding",
      desc: "Name 5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste.",
    },
    {
      emoji: "💨",
      title: "Box Breathing",
      desc: "Inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat.",
    },
    {
      emoji: "📱",
      title: "Reach Out",
      desc: "Call or text someone you trust. You don't have to be alone.",
    },
  ];

  const handleCall = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <Screen scroll>
      <ScreenHeader
        title="Crisis Mode"
        subtitle="You're not alone. Help is available."
        titleStyle={{ color: colors.danger }}
      />

      <AppText variant="sectionTitle" style={styles.sectionTitle}>
        Immediate Help
      </AppText>
      {crisisLines.map((line) => (
        <TouchableOpacity
          key={line.name}
          activeOpacity={0.8}
          onPress={() => handleCall(line.url)}
          style={styles.crisisButtonWrapper}
        >
          <Card style={styles.crisisCard}>
            <AppText variant="sectionTitle" style={styles.whiteText}>
              {line.name}
            </AppText>
            <AppText style={styles.whiteTextMuted}>{line.number}</AppText>
          </Card>
        </TouchableOpacity>
      ))}

      <AppText
        variant="sectionTitle"
        style={[styles.sectionTitle, { marginTop: spacing[32] }]}
      >
        Coping Strategies
      </AppText>
      {copingStrategies.map((strategy) => (
        <Card key={strategy.title} style={styles.strategyCard}>
          <AppText style={styles.strategyEmoji}>{strategy.emoji}</AppText>
          <View style={styles.strategyContent}>
            <AppText variant="sectionTitle" style={styles.strategyTitle}>
              {strategy.title}
            </AppText>
            <AppText variant="smallMuted" style={styles.strategyDesc}>
              {strategy.desc}
            </AppText>
          </View>
        </Card>
      ))}

      <AppText variant="smallMuted" style={styles.reminder}>
        If you're in immediate danger, call 911 or go to your nearest emergency
        room.
      </AppText>
    </Screen>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: spacing[16],
  },
  crisisButtonWrapper: {
    marginBottom: spacing[12],
  },
  crisisCard: {
    backgroundColor: colors.danger,
    padding: spacing[20],
    borderColor: colors.danger,
  },
  whiteText: {
    color: "#FFFFFF",
    marginBottom: spacing[4],
  },
  whiteTextMuted: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
  },
  strategyCard: {
    flexDirection: "row",
    padding: spacing[16],
    marginBottom: spacing[12],
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  strategyEmoji: {
    fontSize: 28,
    marginRight: spacing[16],
  },
  strategyContent: {
    flex: 1,
  },
  strategyTitle: {
    fontSize: 16,
    marginBottom: spacing[4],
  },
  strategyDesc: {
    lineHeight: 20,
  },
  reminder: {
    textAlign: "center",
    marginTop: spacing[32],
    marginBottom: spacing[16],
    fontStyle: "italic",
    paddingHorizontal: spacing[16],
  },
});

export default CrisisScreen;

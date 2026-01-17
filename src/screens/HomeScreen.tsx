import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Screen from "../components/ui/Screen";
import ScreenHeader from "../components/ui/ScreenHeader";
import HeroStreak from "../components/ui/HeroStreak";
import ModeGrid from "../components/ui/ModeGrid";
import { colors, spacing } from "../theme";

const HomeScreen = ({ navigation }: any) => {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadStreak();
  }, []);

  const loadStreak = async () => {
    try {
      const streakCount = await AsyncStorage.getItem("streakCount");
      setStreak(streakCount ? parseInt(streakCount, 10) : 0);
    } catch (e) {
      console.log("Error loading streak:", e);
    }
  };

  const handleModePress = (modeId: string) => {
    switch (modeId) {
      case "ignite":
        navigation.navigate("Focus");
        break;
      case "checkin":
        navigation.navigate("CheckIn");
        break;
      case "crisis":
        navigation.navigate("Crisis");
        break;
      case "fogcutter":
        navigation.navigate("FogCutter");
        break;
      case "pomodoro":
        navigation.navigate("Pomodoro");
        break;
      case "anchor":
        navigation.navigate("Anchor");
        break;
      default:
        console.warn("Unknown mode:", modeId);
    }
  };

  const modes = [
    {
      id: "ignite",
      name: "Ignite",
      icon: "fire",
      desc: "5-min focus timer",
      color: colors.palette.ignite,
    },
    {
      id: "fogcutter",
      name: "Fog Cutter",
      icon: "weather-windy",
      desc: "Break tasks down",
      color: colors.palette.fogcutter,
    },
    {
      id: "pomodoro",
      name: "Pomodoro",
      icon: "timer-cog",
      desc: "Classic timer",
      color: colors.palette.pomodoro,
    },
    {
      id: "anchor",
      name: "Anchor",
      icon: "anchor",
      desc: "Breathing exercises",
      color: colors.palette.anchor,
    },
    {
      id: "checkin",
      name: "Check In",
      icon: "chart-bar",
      desc: "Mood & energy",
      color: colors.palette.checkin,
    },
    {
      id: "crisis",
      name: "Crisis Mode",
      icon: "alert-octagon",
      desc: "Safety resources",
      color: colors.palette.crisis,
    },
  ];

  return (
    <Screen scroll>
      <View style={styles.webContainer}>
        <ScreenHeader
          title="Spark"
          subtitle="Your focus companion"
        />

        <HeroStreak streak={streak} />

        <View style={styles.sectionHeader}>
          {/* Section header could go here if needed */}
        </View>

        <ModeGrid modes={modes} onPressMode={handleModePress} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  webContainer: {
    // Web Polish: Center content and limit width on large screens
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
    paddingBottom: spacing[48], // Extra space at bottom for tab bar
  },
  sectionHeader: {
    marginBottom: spacing[16],
  },
});

export default HomeScreen;

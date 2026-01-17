import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Screen from "../components/ui/Screen";
import ScreenHeader from "../components/ui/ScreenHeader";
import Card from "../components/ui/Card";
import AppText from "../components/ui/AppText";
import { colors, spacing, radius } from "../theme";

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

  const modes = [
    {
      id: "ignite",
      name: "Ignite",
      icon: "fire",
      desc: "5-min focus timer",
      color: "#FF6B6B",
    },
    {
      id: "fogcutter",
      name: "Fog Cutter",
      icon: "weather-windy",
      desc: "Break tasks down",
      color: "#4ECDC4",
    },
    {
      id: "pomodoro",
      name: "Pomodoro",
      icon: "timer-cog",
      desc: "Classic timer",
      color: "#FFBD69",
    },
    {
      id: "anchor",
      name: "Anchor",
      icon: "anchor",
      desc: "Breathing exercises",
      color: "#45B7D1",
    },
    {
      id: "checkin",
      name: "Check In",
      icon: "chart-bar",
      desc: "Mood & energy",
      color: "#A06EE1",
    },
    {
      id: "crisis",
      name: "Crisis Mode",
      icon: "alert-octagon",
      desc: "Safety resources",
      color: colors.danger,
    },
  ];

  return (
    <Screen scroll>
      <View style={styles.header}>
        <ScreenHeader title="Spark" />
        <View style={styles.streakContainer}>
          <Icon
            name="fire"
            size={18}
            color="#FF6B6B"
            style={styles.streakIcon}
          />
          <AppText variant="sectionTitle" style={styles.streakText}>
            {streak} day{streak !== 1 ? "s" : ""} streak
          </AppText>
        </View>
      </View>

      <View style={styles.modesGrid}>
        {modes.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            testID={`mode-${mode.id}`}
            activeOpacity={0.7}
            style={styles.cardWrapper}
            onPress={() => {
              if (mode.id === "checkin") {
                navigation.navigate("CheckIn");
              } else if (mode.id === "crisis") {
                navigation.navigate("Crisis");
              } else if (mode.id === "fogcutter") {
                navigation.navigate("FogCutter");
              } else if (mode.id === "pomodoro") {
                navigation.navigate("Pomodoro");
              } else if (mode.id === "anchor") {
                navigation.navigate("Anchor");
              } else {
                navigation.navigate("Focus");
              }
            }}
          >
            <Card style={styles.modeCard}>
              <Icon
                name={mode.icon}
                size={36}
                color={mode.color}
                style={styles.modeIcon}
              />
              <AppText variant="sectionTitle" style={styles.modeName}>
                {mode.name}
              </AppText>
              <AppText variant="smallMuted" style={styles.modeDesc}>
                {mode.desc}
              </AppText>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing[16],
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[8],
    borderRadius: radius.pill,
    alignSelf: "flex-start",
    marginTop: -spacing[8], // Pull up slightly to group with header
    marginBottom: spacing[16],
  },
  streakIcon: {
    marginRight: spacing[8],
  },
  streakText: {
    fontSize: 14,
  },
  modesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing[8], // Offset card margins
  },
  cardWrapper: {
    width: "50%",
    paddingHorizontal: spacing[8],
    marginBottom: spacing[16],
  },
  modeCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[24],
    minHeight: 150,
  },
  modeIcon: {
    marginBottom: spacing[12],
  },
  modeName: {
    marginBottom: spacing[4],
  },
  modeDesc: {
    textAlign: "center",
    paddingHorizontal: spacing[4],
  },
});

export default HomeScreen;

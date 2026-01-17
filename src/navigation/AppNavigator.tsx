import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import HomeScreen from "../screens/HomeScreen";
import IgniteScreen from "../screens/IgniteScreen";
import FogCutterScreen from "../screens/FogCutterScreen";
import PomodoroScreen from "../screens/PomodoroScreen";
import BrainDumpScreen from "../screens/BrainDumpScreen";
import CalendarScreen from "../screens/CalendarScreen";
import AnchorScreen from "../screens/AnchorScreen";
import CheckInScreen from "../screens/CheckInScreen";
import CrisisScreen from "../screens/CrisisScreen";
import { colors } from "../theme";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="CheckIn" component={CheckInScreen} />
    <Stack.Screen name="Crisis" component={CrisisScreen} />
  </Stack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        const icons: Record<string, string> = {
          Home: focused ? "home" : "home-outline",
          Focus: focused ? "lightning-bolt" : "lightning-bolt-outline",
          Tasks: focused ? "clipboard-text" : "clipboard-text-outline",
          Calendar: focused ? "calendar" : "calendar-outline",
        };
        return (
          <Icon name={icons[route.name]} size={28} color={color} />
        );
      },
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.textMuted,
      headerShown: false,
      tabBarStyle: {
        backgroundColor: colors.background,
        borderTopWidth: 0,
        height: 64,
        paddingBottom: 8,
        elevation: 0,
        shadowOpacity: 0,
      },
    })}
  >
    <Tab.Screen
      name="Home"
      component={HomeStack}
      options={{ tabBarTestID: "tab-home" }}
    />
    <Tab.Screen
      name="Focus"
      component={IgniteScreen}
      options={{ tabBarTestID: "tab-focus" }}
    />
    <Tab.Screen
      name="Tasks"
      component={BrainDumpScreen}
      options={{ tabBarTestID: "tab-tasks" }}
    />
    <Tab.Screen
      name="Calendar"
      component={CalendarScreen}
      options={{ tabBarTestID: "tab-calendar" }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Main" component={TabNavigator} />
    <Stack.Screen name="FogCutter" component={FogCutterScreen} />
    <Stack.Screen name="Pomodoro" component={PomodoroScreen} />
    <Stack.Screen name="Anchor" component={AnchorScreen} />
  </Stack.Navigator>
);

export default AppNavigator;

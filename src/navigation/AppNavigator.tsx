import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '../screens/HomeScreen';
import IgniteScreen from '../screens/IgniteScreen';
import FogCutterScreen from '../screens/FogCutterScreen';
import PomodoroScreen from '../screens/PomodoroScreen';
import BrainDumpScreen from '../screens/BrainDumpScreen';
import CalendarScreen from '../screens/CalendarScreen';
import AnchorScreen from '../screens/AnchorScreen';
import CheckInScreen from '../screens/CheckInScreen';
import CBTGuideScreen from '../screens/CBTGuideScreen';
import { Tokens } from '../theme/tokens';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="CheckIn" component={CheckInScreen} />
    <Stack.Screen name="CBTGuide" component={CBTGuideScreen} />
  </Stack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused }) => {
        const icons: Record<string, string> = {
          Home: 'home',
          Focus: 'fire',
          Tasks: 'text-box-outline',
          Calendar: 'calendar',
        };
        return (
          <Icon
            name={icons[route.name]}
            size={24}
            color={focused ? Tokens.colors.indigo.primary : Tokens.colors.text.tertiary}
          />
        );
      },
      tabBarActiveTintColor: Tokens.colors.indigo.primary,
      tabBarInactiveTintColor: Tokens.colors.text.tertiary,
      headerShown: false,
      tabBarStyle: {
        backgroundColor: Tokens.colors.neutral.darker,
        borderTopWidth: 0,
        height: 60,
        paddingBottom: 8,
        elevation: 0,
        shadowOpacity: 0,
      },
      tabBarLabelStyle: {
        fontFamily: 'Inter',
        fontSize: 12,
        fontWeight: '600',
      },
    })}>
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Focus" component={IgniteScreen} />
    <Tab.Screen name="Tasks" component={BrainDumpScreen} />
    <Tab.Screen name="Calendar" component={CalendarScreen} />
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

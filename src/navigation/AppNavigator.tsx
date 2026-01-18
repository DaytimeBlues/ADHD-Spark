import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import IgniteScreen from '../screens/IgniteScreen';
import FogCutterScreen from '../screens/FogCutterScreen';
import PomodoroScreen from '../screens/PomodoroScreen';
import BrainDumpScreen from '../screens/BrainDumpScreen';
import CalendarScreen from '../screens/CalendarScreen';
import AnchorScreen from '../screens/AnchorScreen';
import CheckInScreen from '../screens/CheckInScreen';
import CrisisScreen from '../screens/CrisisScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="CheckIn" component={CheckInScreen} />
    <Stack.Screen name="Crisis" component={CrisisScreen} />
  </Stack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({route}) => ({
      tabBarIcon: ({focused}) => {
        const icons: Record<string, string> = {
          Home: '🏠',
          Focus: '🔥',
          Tasks: '📝',
          Calendar: '📅',
        };
        return (
          <Text style={{fontSize: 24}}>
            {focused ? icons[route.name] : icons[route.name]}
          </Text>
        );
      },
      tabBarActiveTintColor: '#6200EA',
      tabBarInactiveTintColor: '#888',
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#1A1A2E',
        borderTopWidth: 0,
        height: 60,
        paddingBottom: 8,
      },
    })}>
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Focus" component={IgniteScreen} />
    <Tab.Screen name="Tasks" component={BrainDumpScreen} />
    <Tab.Screen name="Calendar" component={CalendarScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Main" component={TabNavigator} />
    <Stack.Screen name="FogCutter" component={FogCutterScreen} />
    <Stack.Screen name="Pomodoro" component={PomodoroScreen} />
    <Stack.Screen name="Anchor" component={AnchorScreen} />
  </Stack.Navigator>
);

export default AppNavigator;

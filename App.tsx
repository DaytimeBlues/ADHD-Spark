import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar, Platform } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { colors } from "./src/theme";

const linking = {
  prefixes: ['/'],
  config: {
    screens: {
      Home: '',
      Focus: 'focus',
      Tasks: 'tasks',
      Calendar: 'calendar',
    },
  },
};

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer linking={Platform.OS === 'web' ? linking : undefined}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <AppNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;

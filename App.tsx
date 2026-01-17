import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { colors } from "./src/theme";

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <AppNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;

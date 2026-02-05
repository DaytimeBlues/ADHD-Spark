import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar, Platform, View } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  const content = (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#111111" />
      <AppNavigator />
    </NavigationContainer>
  );

  // GestureHandlerRootView can cause issues on web, wrap conditionally
  if (Platform.OS === 'web') {
    return <View style={{ flex: 1 }}>{content}</View>;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {content}
    </GestureHandlerRootView>
  );
};

export default App;

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar, Platform, View, ActivityIndicator } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import StorageService from './src/services/StorageService';
import { Tokens } from './src/theme/tokens';

const App = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await StorageService.init();
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Tokens.colors.neutral.darkest,
        }}
      >
        <ActivityIndicator size="large" color={Tokens.colors.indigo.primary} />
      </View>
    );
  }

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

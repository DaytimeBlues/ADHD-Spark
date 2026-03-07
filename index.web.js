import React from 'react';
import { AppRegistry, Text, View, ScrollView, StyleSheet } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { LoggerService } from './src/services/LoggerService';

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: 'darkred',
    padding: 20,
  },
  errorTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  errorMessage: {
    color: 'white',
    marginTop: 20,
  },
  errorStack: {
    color: '#ccc',
    marginTop: 10,
  },
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    LoggerService.error({
      service: 'index.web',
      operation: 'componentDidCatch',
      message: 'ErrorBoundary caught error',
      error,
      context: { errorInfo },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Application Crashed</Text>
          <ScrollView>
            <Text style={styles.errorMessage}>
              {this.state.error?.toString()}
            </Text>
            <Text style={styles.errorStack}>{this.state.error?.stack}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const Root = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

AppRegistry.registerComponent(appName, () => Root);
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
});

import React from 'react';
import { AppRegistry, Text, View, ScrollView } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: 'darkred', padding: 20 }}>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Application Crashed</Text>
          <ScrollView>
            <Text style={{ color: 'white', marginTop: 20 }}>
              {this.state.error?.toString()}
            </Text>
            <Text style={{ color: '#ccc', marginTop: 10 }}>
              {this.state.error?.stack}
            </Text>
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

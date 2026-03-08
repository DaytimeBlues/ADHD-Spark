import React, { Component, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import * as Sentry from '@sentry/react-native';
import { LoggerService } from '../services/LoggerService';
import { Tokens } from '../theme/tokens';
import { useTheme, ThemeContextValue } from '../theme/useTheme';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

type ErrorBoundaryInternalProps = ErrorBoundaryProps &
  Pick<ThemeContextValue, 'isCosmic' | 't'>;

class ErrorBoundaryInternal extends Component<
  ErrorBoundaryInternalProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryInternalProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (__DEV__) {
      LoggerService.error({
        service: 'ErrorBoundary',
        operation: 'componentDidCatch',
        message: 'ErrorBoundary caught error',
        error,
        context: { componentStack: errorInfo.componentStack },
      });
    }

    // Send error to tracking service
    Sentry.captureException(error);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { isCosmic, t } = this.props;
    const styles = getStyles(isCosmic, t);

    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              We're sorry for the inconvenience. The app encountered an
              unexpected error.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>
                  Debug Info (Development Only):
                </Text>
                <Text style={styles.debugText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.debugText}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={this.handleReset}
              accessibilityRole="button"
              accessibilityLabel="Try again"
              accessibilityHint="Retry rendering the app after an error"
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const ErrorBoundary = (props: ErrorBoundaryProps) => {
  const { isCosmic, t } = useTheme();
  return <ErrorBoundaryInternal {...props} isCosmic={isCosmic} t={t} />;
};

const getStyles = (isCosmic: boolean, t: ThemeContextValue['t']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isCosmic
        ? t.colors.neutral.darkest
        : t.colors.neutral.darkest,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: t.spacing[6] || 24,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: t.colors.text?.primary || Tokens.colors.text.primary,
      marginBottom: 16,
      textAlign: 'center',
    },
    message: {
      fontSize: 16,
      color: t.colors.text?.secondary || Tokens.colors.text.secondary,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 24,
    },
    debugContainer: {
      backgroundColor: isCosmic
        ? t.colors.neutral.dark
        : t.colors.neutral.borderSubtle,
      borderRadius: 8,
      padding: 16,
      marginBottom: 24,
      maxHeight: 200,
      width: '100%',
    },
    debugTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: t.colors.semantic.error,
      marginBottom: 8,
    },
    debugText: {
      fontSize: 12,
      color: t.colors.neutral.light,
      fontFamily: 'monospace',
    },
    button: {
      backgroundColor: t.colors.semantic.primary,
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 100,
      minWidth: 200,
      alignItems: 'center',
    },
    buttonText: {
      color: t.colors.text?.primary || Tokens.colors.text.primary,
      fontSize: 16,
      fontWeight: '600',
    },
  });

export default ErrorBoundary;

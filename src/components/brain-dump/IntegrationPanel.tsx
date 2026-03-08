import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../theme/useTheme';
import { Tokens } from '../../theme/tokens';
import {
  OAuthService,
  GoogleAuthData,
  TodoistAuthData,
} from '../../services/OAuthService';
import { LoggerService } from '../../services/LoggerService';

/**
 * IntegrationPanel
 *
 * Displays OAuth connection status for Google and Todoist
 * in the BrainDump/Tasks screen.
 */

interface IntegrationPanelProps {
  onGoogleConnect?: () => void;
  onTodoistConnect?: () => void;
}

export const IntegrationPanel: React.FC<IntegrationPanelProps> = ({
  onGoogleConnect,
  onTodoistConnect,
}) => {
  const { isCosmic } = useTheme();
  const [googleAuth, setGoogleAuth] = useState<GoogleAuthData | null>(null);
  const [todoistAuth, setTodoistAuth] = useState<TodoistAuthData | null>(null);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingTodoist, setIsLoadingTodoist] = useState(false);

  const loadAuthStatus = useCallback(async () => {
    try {
      const [google, todoist] = await Promise.all([
        OAuthService.getGoogleAuth(),
        OAuthService.getTodoistAuth(),
      ]);
      setGoogleAuth(google);
      setTodoistAuth(todoist);
    } catch (error) {
      LoggerService.error({
        service: 'IntegrationPanel',
        operation: 'loadAuthStatus',
        message: 'Failed to load auth status',
        error,
      });
    }
  }, []);

  // Load auth status on mount
  useEffect(() => {
    loadAuthStatus();
  }, [loadAuthStatus]);

  const handleGoogleConnect = async () => {
    if (googleAuth?.connected) {
      // Show disconnect confirmation
      Alert.alert(
        'Disconnect Google',
        'Are you sure you want to disconnect your Google account?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disconnect',
            style: 'destructive',
            onPress: async () => {
              await OAuthService.disconnectGoogle();
              setGoogleAuth(null);
            },
          },
        ],
      );
      return;
    }

    setIsLoadingGoogle(true);
    try {
      const result = await OAuthService.initiateGoogleAuth();
      if (result.success) {
        await loadAuthStatus();
        onGoogleConnect?.();
      } else {
        Alert.alert(
          'Connection Failed',
          result.error || 'Failed to connect to Google',
        );
      }
    } catch (error) {
      LoggerService.error({
        service: 'IntegrationPanel',
        operation: 'handleGoogleConnect',
        message: 'Google connect failed',
        error,
      });
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleTodoistConnect = async () => {
    if (todoistAuth?.connected) {
      Alert.alert(
        'Disconnect Todoist',
        'Are you sure you want to disconnect your Todoist account?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disconnect',
            style: 'destructive',
            onPress: async () => {
              await OAuthService.disconnectTodoist();
              setTodoistAuth(null);
            },
          },
        ],
      );
      return;
    }

    setIsLoadingTodoist(true);
    try {
      const result = await OAuthService.initiateTodoistAuth();
      if (result.success) {
        await loadAuthStatus();
        onTodoistConnect?.();
      } else {
        Alert.alert(
          'Connection Failed',
          result.error || 'Failed to connect to Todoist',
        );
      }
    } catch (error) {
      LoggerService.error({
        service: 'IntegrationPanel',
        operation: 'handleTodoistConnect',
        message: 'Todoist connect failed',
        error,
      });
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoadingTodoist(false);
    }
  };

  const styles = getStyles(isCosmic);

  return (
    <View style={styles.container} testID="integrations-panel">
      <Text style={styles.title}>INTEGRATIONS</Text>

      {/* Google Integration */}
      <View style={styles.integrationRow}>
        <View style={styles.iconContainer}>
          <Icon name="google" size={20} color="#4285F4" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.integrationName}>Google Tasks</Text>
          {googleAuth?.connected ? (
            <Text style={styles.connectedText} numberOfLines={1}>
              {googleAuth.email}
            </Text>
          ) : (
            <Text style={styles.disconnectedText}>Not connected</Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            googleAuth?.connected && styles.disconnectButton,
          ]}
          onPress={handleGoogleConnect}
          disabled={isLoadingGoogle}
          testID={
            googleAuth?.connected
              ? 'google-disconnect-btn'
              : 'google-connect-btn'
          }
        >
          {isLoadingGoogle ? (
            <ActivityIndicator
              size="small"
              color={isCosmic ? '#EEF2FF' : '#FFF'}
            />
          ) : (
            <Text style={styles.buttonText}>
              {googleAuth?.connected ? 'Disconnect' : 'Connect'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Todoist Integration */}
      <View style={styles.integrationRow}>
        <View style={styles.iconContainer}>
          <Icon name="check-circle-outline" size={20} color="#E44332" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.integrationName}>Todoist</Text>
          {todoistAuth?.connected ? (
            <Text style={styles.connectedText} numberOfLines={1}>
              {todoistAuth.email || 'Connected'}
            </Text>
          ) : (
            <Text style={styles.disconnectedText}>Not connected</Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            todoistAuth?.connected && styles.disconnectButton,
          ]}
          onPress={handleTodoistConnect}
          disabled={isLoadingTodoist}
          testID={
            todoistAuth?.connected
              ? 'todoist-disconnect-btn'
              : 'todoist-connect-btn'
          }
        >
          {isLoadingTodoist ? (
            <ActivityIndicator
              size="small"
              color={isCosmic ? '#EEF2FF' : '#FFF'}
            />
          ) : (
            <Text style={styles.buttonText}>
              {todoistAuth?.connected ? 'Disconnect' : 'Connect'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Status Indicators */}
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusIndicator,
            googleAuth?.connected
              ? styles.statusConnected
              : styles.statusDisconnected,
          ]}
          testID="google-status-connected"
        >
          <Icon
            name={googleAuth?.connected ? 'check' : 'close'}
            size={12}
            color="#FFF"
          />
        </View>
        <Text style={styles.statusText}>Google</Text>

        <View style={styles.statusSpacer} />

        <View
          style={[
            styles.statusIndicator,
            todoistAuth?.connected
              ? styles.statusConnected
              : styles.statusDisconnected,
          ]}
          testID="todoist-status-connected"
        >
          <Icon
            name={todoistAuth?.connected ? 'check' : 'close'}
            size={12}
            color="#FFF"
          />
        </View>
        <Text style={styles.statusText}>Todoist</Text>
      </View>
    </View>
  );
};

const getStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    container: {
      marginTop: 16,
      marginBottom: 8,
      padding: 16,
      backgroundColor: isCosmic
        ? 'rgba(139, 92, 246, 0.1)'
        : Tokens.colors.neutral.dark,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(139, 92, 246, 0.3)'
        : Tokens.colors.neutral.border,
    },
    title: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
      letterSpacing: 1,
      marginBottom: 12,
    },
    integrationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isCosmic
        ? 'rgba(139, 92, 246, 0.2)'
        : Tokens.colors.neutral.darker,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    textContainer: {
      flex: 1,
    },
    integrationName: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.sm,
      fontWeight: '600',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
    },
    connectedText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: isCosmic ? '#10B981' : Tokens.colors.success.main,
      marginTop: 2,
    },
    disconnectedText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.tertiary,
      marginTop: 2,
    },
    button: {
      backgroundColor: Tokens.colors.indigo.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      minWidth: 80,
      alignItems: 'center',
    },
    disconnectButton: {
      backgroundColor: isCosmic
        ? 'rgba(251, 113, 133, 0.2)'
        : Tokens.colors.error.main,
      borderWidth: 1,
      borderColor: isCosmic ? '#FB7185' : 'transparent',
    },
    buttonText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: '#FFF',
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isCosmic
        ? 'rgba(139, 92, 246, 0.2)'
        : Tokens.colors.neutral.border,
    },
    statusIndicator: {
      width: 16,
      height: 16,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statusConnected: {
      backgroundColor: '#10B981',
    },
    statusDisconnected: {
      backgroundColor: isCosmic ? '#B9C2D9' : Tokens.colors.text.tertiary,
    },
    statusText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xxs,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
      marginLeft: 4,
      marginRight: 12,
    },
    statusSpacer: {
      width: 16,
    },
  });

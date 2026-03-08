import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';

interface BrainDumpErrorProps {
  error: string;
  showConnectButton?: boolean;
  isConnecting?: boolean;
  onConnect?: () => void;
}

export const BrainDumpError: React.FC<BrainDumpErrorProps> = ({
  error,
  showConnectButton = false,
  isConnecting = false,
  onConnect,
}) => {
  const { isCosmic } = useTheme();
  const styles = getStyles(isCosmic);

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      {showConnectButton && (
        <Pressable
          onPress={onConnect}
          disabled={isConnecting}
          style={({ pressed }) => [
            styles.connectButton,
            isConnecting && styles.connectButtonDisabled,
            pressed && styles.connectButtonPressed,
          ]}
        >
          <Text style={styles.connectButtonText}>
            {isConnecting ? 'CONNECTING...' : 'CONNECT GOOGLE'}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const getStyles = (_isCosmic: boolean) =>
  StyleSheet.create({
    errorContainer: {
      marginTop: Tokens.spacing[2],
      marginBottom: Tokens.spacing[4],
      alignItems: 'center',
    },
    errorText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: Tokens.colors.brand[500],
      textAlign: 'center',
    },
    connectButton: {
      marginTop: Tokens.spacing[3],
      backgroundColor: Tokens.colors.indigo.primary,
      paddingHorizontal: Tokens.spacing[4],
      paddingVertical: Tokens.spacing[2],
      borderRadius: Tokens.radii.md,
    },
    connectButtonPressed: {
      opacity: 0.8,
    },
    connectButtonDisabled: {
      opacity: 0.6,
    },
    connectButtonText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: Tokens.colors.text.primary,
      fontWeight: '700',
    },
  });

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Tokens } from '../../theme/tokens';
import { LinearButton } from './LinearButton';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  primaryVariant?: 'primary' | 'secondary' | 'ghost' | 'error';
  style?: ViewStyle;
  testID?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
  primaryVariant = 'primary',
  style,
  testID,
}) => {
  return (
    <View style={[styles.container, style]} testID={testID}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {primaryActionLabel && onPrimaryAction && (
        <View style={styles.actionContainer}>
          <LinearButton
            title={primaryActionLabel}
            onPress={onPrimaryAction}
            variant={primaryVariant}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Tokens.spacing[8],
  },
  icon: {
    fontFamily: Tokens.type.fontFamily.sans, // Default to sans for emoji
    fontSize: Tokens.type['5xl'],
    marginBottom: Tokens.spacing[4],
    textAlign: 'center',
  },
  title: {
    fontFamily: Tokens.type.fontFamily.mono,
    color: Tokens.colors.text.secondary,
    fontSize: Tokens.type.sm,
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  description: {
    fontFamily: Tokens.type.fontFamily.mono,
    color: Tokens.colors.text.tertiary,
    fontSize: Tokens.type.xs,
    textAlign: 'center',
    marginTop: Tokens.spacing[2],
    maxWidth: 300,
  },
  actionContainer: {
    marginTop: Tokens.spacing[6],
  },
});

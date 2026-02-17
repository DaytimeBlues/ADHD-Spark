import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tokens } from '../../theme/tokens';
import { LinearButton } from './LinearButton';

export type ReEntryPromptLevel = 'gentle_restart' | 'fresh_restart';

interface ReEntryPromptProps {
  level: ReEntryPromptLevel;
  onPrimaryAction: () => void;
  testID?: string;
}

export const ReEntryPrompt: React.FC<ReEntryPromptProps> = ({
  level,
  onPrimaryAction,
  testID,
}) => {
  const message =
    level === 'gentle_restart'
      ? 'RESTART_PROTOCOL: START_SMALL'
      : 'FRESH_START: EXECUTE_ONE_TASK';

  const buttonLabel =
    level === 'gentle_restart' ? 'START SMALL' : 'EXECUTE ONE TASK';

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.message}>{message}</Text>
      <LinearButton
        title={buttonLabel}
        onPress={onPrimaryAction}
        variant="primary"
        size="sm"
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Tokens.spacing[3],
    paddingTop: Tokens.spacing[3],
    borderTopWidth: 1,
    borderTopColor: Tokens.colors.neutral.dark,
    width: '100%',
  },
  message: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xxs,
    color: Tokens.colors.brand[500],
    letterSpacing: 0.5,
    fontWeight: '700',
    marginBottom: Tokens.spacing[3],
  },
  button: {
    width: '100%',
  },
});

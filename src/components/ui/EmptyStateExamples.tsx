import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

interface ExampleTaskChipProps {
  label: string;
  onPress: () => void;
}

const ExampleTaskChip: React.FC<ExampleTaskChipProps> = ({
  label,
  onPress,
}) => {
  const { isCosmic } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: isCosmic
            ? 'rgba(139, 92, 246, 0.2)'
            : Tokens.colors.neutral.darker,
          borderColor: isCosmic
            ? 'rgba(139, 92, 246, 0.4)'
            : Tokens.colors.neutral.border,
        },
        pressed && styles.chipPressed,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

interface EmptyStateExamplesProps {
  onExamplePress: (example: string) => void;
}

const EXAMPLE_TASKS = [
  'Clean my room',
  'Write an email',
  'Study for exam',
  'Plan dinner',
  'Fix the bug',
];

export const EmptyStateExamples: React.FC<EmptyStateExamplesProps> = ({
  onExamplePress,
}) => {
  const { isCosmic } = useTheme();

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          { color: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500] },
        ]}
      >
        TRY AN EXAMPLE
      </Text>
      <View style={styles.chipContainer}>
        {EXAMPLE_TASKS.map((task) => (
          <ExampleTaskChip
            key={task}
            label={task}
            onPress={() => onExamplePress(task)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Tokens.spacing[4],
    alignItems: 'center',
  },
  title: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Tokens.spacing[3],
    textTransform: 'uppercase',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Tokens.spacing[2],
  },
  chip: {
    paddingHorizontal: Tokens.spacing[3],
    paddingVertical: Tokens.spacing[2],
    borderRadius: 16,
    borderWidth: 1,
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipText: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.sm,
  },
});

export default EmptyStateExamples;

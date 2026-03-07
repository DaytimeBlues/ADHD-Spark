import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';

interface ExampleTaskChipProps {
  label: string;
  onPress: () => void;
  isCosmic: boolean;
}

const ExampleTaskChip: React.FC<ExampleTaskChipProps> = ({
  label,
  onPress,
  isCosmic,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        isCosmic ? styles.chipCosmic : styles.chipLinear,
        pressed && styles.chipPressed,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          isCosmic ? styles.chipTextCosmic : styles.chipTextLinear,
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
          isCosmic ? styles.titleCosmic : styles.titleLinear,
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
            isCosmic={isCosmic}
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
  titleCosmic: {
    color: '#8B5CF6',
  },
  titleLinear: {
    color: Tokens.colors.brand[500],
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
  chipCosmic: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  chipLinear: {
    backgroundColor: Tokens.colors.neutral.darker,
    borderColor: Tokens.colors.neutral.border,
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipText: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.sm,
  },
  chipTextCosmic: {
    color: '#B9C2D9',
  },
  chipTextLinear: {
    color: Tokens.colors.text.secondary,
  },
});

export default EmptyStateExamples;

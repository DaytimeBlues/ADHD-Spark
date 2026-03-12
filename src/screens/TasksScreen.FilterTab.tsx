import React, { memo, useMemo } from 'react';
import { Pressable, Text } from 'react-native';
import { RuneButton } from '../ui/cosmic';
import { getTasksScreenStyles } from './TasksScreen.styles';
import { useTheme } from '../theme/useTheme';

interface FilterTabProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

export const FilterTab = memo(function FilterTab({
  label,
  active,
  onPress,
}: FilterTabProps) {
  const { isNightAwe, t, variant } = useTheme();
  const styles = useMemo(() => getTasksScreenStyles(variant, t), [t, variant]);

  if (isNightAwe) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label} tasks`}
        style={({ pressed }) => [
          styles.filterTabButton,
          active && styles.filterTabButtonActive,
          pressed && { opacity: 0.88 },
        ]}
      >
        <Text
          style={[
            styles.filterTabButtonText,
            active && styles.filterTabButtonTextActive,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <RuneButton
      variant={active ? 'primary' : 'ghost'}
      size="sm"
      onPress={onPress}
      style={styles.filterTab}
    >
      {label}
    </RuneButton>
  );
});

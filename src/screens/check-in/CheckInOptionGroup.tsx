import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { ThemeTokens } from '../../theme/types';
import type { ThemeVariant } from '../../theme/themeVariant';
import type { CheckInOption } from './checkInData';
import { getCheckInScreenStyles } from '../CheckInScreen.styles';

interface Props {
  variant: ThemeVariant;
  t: ThemeTokens;
  title: string;
  options: CheckInOption[];
  selectedValue: number | null;
  testIdPrefix: string;
  onSelect: (value: number) => void;
}

export const CheckInOptionGroup = ({
  variant,
  t,
  title,
  options,
  selectedValue,
  testIdPrefix,
  onSelect,
}: Props) => {
  const styles = getCheckInScreenStyles(variant, t);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.options}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            testID={`${testIdPrefix}-${option.value}`}
            style={(state) => [
              styles.option,
              selectedValue === option.value && styles.selected,
              (state as { pressed: boolean; hovered?: boolean }).hovered &&
                selectedValue !== option.value &&
                styles.optionHovered,
              state.pressed && styles.optionPressed,
            ]}
            onPress={() => onSelect(option.value)}
          >
            <View style={styles.optionContent}>
              <Text
                style={[
                  styles.label,
                  selectedValue === option.value && styles.selectedLabel,
                ]}
              >
                {option.label.toUpperCase()}
              </Text>
              <Text
                style={[
                  styles.quote,
                  selectedValue === option.value && styles.selectedQuote,
                ]}
              >
                {option.quote}
              </Text>
              <Text style={styles.author}>— {option.author}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

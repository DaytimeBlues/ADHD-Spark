/**
 * GoogleCalendarConnection component
 */

import React from 'react';
import { Text, Pressable } from 'react-native';
import { GlowCard } from '../../ui/cosmic';
import { useTheme } from '../../theme/useTheme';
import { calendarStyles } from './calendarStyles';

interface GoogleCalendarConnectionProps {
  statusText: string;
  buttonText: string;
  isButtonDisabled: boolean;
  onConnect: () => void;
}

export const GoogleCalendarConnection: React.FC<
  GoogleCalendarConnectionProps
> = ({ statusText, buttonText, isButtonDisabled, onConnect }) => {
  const { variant, t } = useTheme();
  const styles = calendarStyles(variant, t);

  return (
    <GlowCard glow="none" style={styles.googleCalendarCard}>
      <Text style={styles.googleCalendarTitle}>GOOGLE CALENDAR</Text>
      <Text style={styles.googleCalendarStatus}>{statusText}</Text>
      <Pressable
        onPress={onConnect}
        disabled={isButtonDisabled}
        accessibilityLabel={buttonText}
        accessibilityHint="Connect or disconnect your Google Calendar for syncing"
        accessibilityRole="button"
        accessibilityState={{ disabled: isButtonDisabled }}
        style={({ pressed }) => [
          styles.googleCalendarButton,
          pressed && !isButtonDisabled && styles.googleCalendarButtonPressed,
          isButtonDisabled && styles.googleCalendarButtonDisabled,
        ]}
      >
        <Text style={styles.googleCalendarButtonText}>{buttonText}</Text>
      </Pressable>
    </GlowCard>
  );
};

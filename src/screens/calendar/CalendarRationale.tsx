/**
 * CalendarRationale component
 */

import React from 'react';
import { Text } from 'react-native';
import { GlowCard } from '../../ui/cosmic';
import { useTheme } from '../../theme/useTheme';
import { calendarStyles } from './calendarStyles';

export const CalendarRationale: React.FC = () => {
  const { variant, t } = useTheme();
  const styles = calendarStyles(variant, t);

  return (
    <GlowCard glow="none" style={styles.rationaleCard}>
      <Text style={styles.rationaleTitle}>WHY THIS WORKS</Text>
      <Text style={styles.rationaleText}>
        Externalizing time through visual calendars reduces ADHD time-blindness
        and improves prospective memory. Seeing commitments spatially helps with
        planning, transitions, and preventing double-booking. CBT emphasizes
        external structure as cognitive support.
      </Text>
    </GlowCard>
  );
};

import React from 'react';
import {
    View,
    Text,
    Pressable,
} from 'react-native';
import { GlowCard } from '../../ui/cosmic';

// ============================================================================
// CONSTANTS
// ============================================================================

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

// ============================================================================
// COMPONENTS
// ============================================================================

export const RationaleCard = ({ isCosmic, styles }: { isCosmic: boolean, styles: any }) => (
    <GlowCard glow="none" style={styles.rationaleCard}>
        <Text style={[styles.rationaleTitle, isCosmic && styles.rationaleTitleCosmic]}>
            WHY THIS WORKS
        </Text>
        <Text style={[styles.rationaleText, isCosmic && styles.rationaleTextCosmic]}>
            Externalizing time through visual calendars reduces ADHD
            time-blindness and improves prospective memory. Seeing
            commitments spatially helps with planning, transitions, and
            preventing double-booking. CBT emphasizes external structure as
            cognitive support.
        </Text>
    </GlowCard>
);

export const CalendarHeader = ({
    currentDate,
    prevMonth,
    nextMonth,
    isCosmic,
    styles
}: {
    currentDate: Date,
    prevMonth: () => void,
    nextMonth: () => void,
    isCosmic: boolean,
    styles: any
}) => (
    <View style={styles.header}>
        <Pressable
            onPress={prevMonth}
            style={({ pressed, hovered }: any) => [
                styles.navButton,
                isCosmic && styles.navButtonCosmic,
                hovered && styles.navButtonHovered,
                hovered && isCosmic && styles.navButtonHoveredCosmic,
                pressed && styles.navButtonPressed,
                pressed && isCosmic && styles.navButtonPressedCosmic,
            ]}
        >
            <Text style={[styles.navButtonText, isCosmic && styles.navButtonTextCosmic]}>‹</Text>
        </Pressable>
        <Text style={[styles.monthText, isCosmic && styles.monthTextCosmic]}>
            {MONTHS[currentDate.getMonth()].toUpperCase()} {currentDate.getFullYear()}
        </Text>
        <Pressable
            onPress={nextMonth}
            style={({ pressed, hovered }: any) => [
                styles.navButton,
                isCosmic && styles.navButtonCosmic,
                hovered && styles.navButtonHovered,
                hovered && isCosmic && styles.navButtonHoveredCosmic,
                pressed && styles.navButtonPressed,
                pressed && isCosmic && styles.navButtonPressedCosmic,
            ]}
        >
            <Text style={[styles.navButtonText, isCosmic && styles.navButtonTextCosmic]}>›</Text>
        </Pressable>
    </View>
);

export const WeekdaysHeader = ({ isCosmic, styles }: { isCosmic: boolean, styles: any }) => (
    <View style={styles.weekdays}>
        {DAYS.map((day) => (
            <Text key={day} style={[styles.weekdayText, isCosmic && styles.weekdayTextCosmic]}>
                {day}
            </Text>
        ))}
    </View>
);

export const DaysGrid = ({
    firstDay,
    daysArray,
    currentDate,
    isCosmic,
    styles
}: {
    firstDay: number,
    daysArray: number[],
    currentDate: Date,
    isCosmic: boolean,
    styles: any
}) => {
    const today = new Date();
    return (
        <View style={styles.daysGrid}>
            {Array(firstDay).fill(0).map((_, i) => (
                <View key={`empty-${i}`} style={[styles.dayCell, isCosmic && styles.dayCellCosmic]} />
            ))}
            {daysArray.map((day) => {
                const isToday =
                    day === today.getDate() &&
                    currentDate.getMonth() === today.getMonth() &&
                    currentDate.getFullYear() === today.getFullYear();
                return (
                    <Pressable
                        key={day}
                        style={({ pressed, hovered }: any) => [
                            styles.dayCell,
                            isCosmic && styles.dayCellCosmic,
                            isToday && styles.todayCell,
                            isToday && isCosmic && styles.todayCellCosmic,
                            hovered && !isToday && styles.dayCellHovered,
                            hovered && !isToday && isCosmic && styles.dayCellHoveredCosmic,
                            pressed && !isToday && styles.dayCellPressed,
                            pressed && !isToday && isCosmic && styles.dayCellPressedCosmic,
                        ]}
                    >
                        <Text
                            style={[
                                styles.dayText,
                                isCosmic && styles.dayTextCosmic,
                                isToday && styles.todayText,
                                isToday && isCosmic && styles.todayTextCosmic,
                            ]}
                        >
                            {day}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
};

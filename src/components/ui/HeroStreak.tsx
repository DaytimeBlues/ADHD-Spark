import React, { useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
} from "react-native-reanimated";
import { colors, radius, spacing } from "../../theme";
import AppText from "./AppText";
import GlassCard from "./GlassCard";

interface HeroStreakProps {
    streak: number;
}

const HeroStreak = ({ streak }: HeroStreakProps) => {
    const pulses = [1, 2, 3];

    return (
        <View style={styles.container}>
            <GlassCard style={styles.card} variant="highlight">
                <View style={styles.content}>
                    <AppText variant="sectionTitle" style={styles.label}>
                        Current Streak
                    </AppText>

                    <View style={styles.flameContainer}>
                        {/* Pulsing circles behind the flame */}
                        {pulses.map((_, i) => (
                            <PulseCircle key={i} delay={i * 400} />
                        ))}

                        <Icon
                            name="fire"
                            size={64}
                            color={colors.palette.ignite}
                            style={styles.icon}
                        />
                    </View>

                    <View style={styles.statsRow}>
                        <AppText variant="screenTitle" style={styles.count}>
                            {streak}
                        </AppText>
                        <AppText variant="body" style={styles.days}>
                            days
                        </AppText>
                    </View>

                    <AppText variant="smallMuted" style={styles.motivation}>
                        You're on fire! Keep the momentum going.
                    </AppText>
                </View>
            </GlassCard>
        </View>
    );
};

// Sub-component for animation
const PulseCircle = ({ delay }: { delay: number }) => {
    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0.6);

    useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withTiming(1.5, { duration: 2000, easing: Easing.out(Easing.ease) }),
                withTiming(0.8, { duration: 0 }) // Reset
            ),
            -1,
            false
        );
        opacity.value = withRepeat(
            withSequence(
                withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
                withTiming(0.6, { duration: 0 }) // Reset
            ),
            -1,
            false
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return <Animated.View style={[styles.pulse, style]} />;
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing[24],
    },
    card: {
        alignItems: "center",
        paddingVertical: spacing[32],
    },
    content: {
        alignItems: "center",
    },
    label: {
        color: colors.glass.textMuted,
        marginBottom: spacing[16],
        textTransform: "uppercase",
        letterSpacing: 2,
        fontSize: 12,
    },
    flameContainer: {
        width: 100,
        height: 100,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing[16],
    },
    icon: {
        zIndex: 2,
        // Add subtle shadow for the icon itself
        textShadowColor: "rgba(255, 107, 107, 0.5)",
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    } as any,
    pulse: {
        position: "absolute",
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(255, 107, 107, 0.2)",
        zIndex: 1,
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "baseline",
        marginBottom: spacing[8],
    },
    count: {
        fontSize: 48,
        color: colors.text,
        fontWeight: "bold",
        marginRight: spacing[4],
    },
    days: {
        fontSize: 20,
        color: colors.glass.textMuted,
    },
    motivation: {
        color: colors.glass.textMuted,
    },
});

export default HeroStreak;

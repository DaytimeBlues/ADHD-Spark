import React from "react";
import { View, StyleSheet, useWindowDimensions, Platform } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { colors, spacing } from "../../theme";
import AppText from "./AppText";
import GlassCard from "./GlassCard";
import ScaleButton from "./ScaleButton";

interface Mode {
    id: string;
    name: string;
    icon: string;
    desc: string;
    color: string;
}

interface ModeGridProps {
    modes: Mode[];
    onPressMode: (id: string) => void;
}

const ModeGrid = ({ modes, onPressMode }: ModeGridProps) => {
    const { width } = useWindowDimensions();

    // Responsive Layout Logic
    // Mobile < 768px: 2 columns
    // Tablet/Web >= 768px: 3 columns
    const numColumns = width >= 768 ? 3 : 2;
    const gap = spacing[16];
    // Calculate item width accounting for gaps and screen padding (approx 32px total padding)
    const availableWidth = width - (spacing[16] * 2);
    const itemWidth = (availableWidth - (gap * (numColumns - 1))) / numColumns;

    return (
        <View style={[styles.grid, { gap }]}>
            {modes.map((mode) => (
                <View key={mode.id} style={{ width: itemWidth }}>
                    <ScaleButton onPress={() => onPressMode(mode.id)} testID={`mode-${mode.id}`}>
                        <GlassCard style={[styles.card, { borderColor: mode.color + "40" }]}>
                            <View style={[styles.iconContainer, { backgroundColor: mode.color + "20" }]}>
                                <Icon name={mode.icon} size={32} color={mode.color} />
                            </View>
                            <AppText variant="sectionTitle" style={styles.name}>
                                {mode.name}
                            </AppText>
                            <AppText variant="smallMuted" style={styles.desc} numberOfLines={2}>
                                {mode.desc}
                            </AppText>
                        </GlassCard>
                    </ScaleButton>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
    },
    card: {
        height: 160,
        alignItems: "center",
        justifyContent: "center",
        padding: spacing[16],
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing[16],
    },
    name: {
        fontSize: 16,
        marginBottom: spacing[4],
        textAlign: "center",
    },
    desc: {
        textAlign: "center",
        fontSize: 12,
        opacity: 0.7,
    },
});

export default ModeGrid;

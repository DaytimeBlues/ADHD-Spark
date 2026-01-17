import React from "react";
import { View, StyleSheet, ViewStyle, Platform } from "react-native";
import { colors, radius, spacing } from "../../theme";

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: "default" | "highlight";
}

const GlassCard = ({ children, style, variant = "default" }: GlassCardProps) => {
    const isWeb = Platform.OS === "web";

    const webStyle = isWeb
        ? {
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        }
        : {};

    return (
        <View style={[styles.card, variant === "highlight" && styles.highlight, isWeb && (webStyle as any), style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.glass.background,
        borderColor: colors.glass.border,
        borderWidth: 1,
        borderRadius: radius.card,
        padding: spacing[16],
        // Native shadow fallback
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
            },
            android: {
                elevation: 0, // No elevation on android to keep flat glass look, or low elevation
            },
        }),
    },
    highlight: {
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
});

export default GlassCard;

import { StyleSheet } from "react-native";
import { colors } from "./tokens";

export const typography = StyleSheet.create({
    screenTitle: {
        fontFamily: "Outfit-Bold",
        fontSize: 28,
        lineHeight: 32,
        color: colors.text,
    },
    screenSubtitle: {
        fontFamily: "Outfit-Regular",
        fontSize: 16,
        lineHeight: 22,
        color: colors.textMuted,
    },
    sectionTitle: {
        fontFamily: "Outfit-Medium",
        fontSize: 18,
        lineHeight: 24,
        color: colors.text,
    },
    body: {
        fontFamily: "Outfit-Regular",
        fontSize: 16,
        lineHeight: 22,
        color: colors.text,
    },
    smallMuted: {
        fontFamily: "Outfit-Regular",
        fontSize: 14,
        lineHeight: 20,
        color: colors.textMuted,
    },
    timer: {
        fontFamily: "Outfit-Bold",
        fontSize: 72,
        lineHeight: 76,
        color: colors.text,
        fontVariant: ["tabular-nums"],
    },
});

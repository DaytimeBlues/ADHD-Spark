import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleProp,
    ViewStyle,
} from "react-native";
import { colors, spacing } from "../../theme/tokens";

type Props = {
    children: React.ReactNode;
    scroll?: boolean;
    style?: StyleProp<ViewStyle>;
    contentStyle?: StyleProp<ViewStyle>;
};

export default function Screen({ children, scroll, style, contentStyle }: Props) {
    if (scroll) {
        return (
            <SafeAreaView style={[{ flex: 1, backgroundColor: colors.background }, style]}>
                <ScrollView contentContainerStyle={[{ padding: spacing[16] }, contentStyle]}>
                    {children}
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={[
                { flex: 1, backgroundColor: colors.background, padding: spacing[16] },
                style,
            ]}
        >
            {children}
        </SafeAreaView>
    );
}

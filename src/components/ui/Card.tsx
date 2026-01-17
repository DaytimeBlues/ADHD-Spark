import React from "react";
import { View, ViewStyle, StyleProp } from "react-native";
import { colors, radius, spacing } from "../../theme/tokens";

type Props = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
};

export default function Card({ children, style }: Props) {
    return (
        <View
            style={[
                {
                    backgroundColor: colors.surface,
                    borderRadius: radius.card,
                    padding: spacing[16],
                    marginBottom: spacing[16],
                },
                style,
            ]}
        >
            {children}
        </View>
    );
}

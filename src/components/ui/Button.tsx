import React from "react";
import { Pressable, ViewStyle, TextStyle } from "react-native";
import { colors, radius, spacing } from "../../theme/tokens";
import AppText from "./AppText";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "md" | "lg";

type Props = {
    label: string;
    onPress: () => void;
    variant?: Variant;
    size?: Size;
    disabled?: boolean;
    style?: ViewStyle;
};

const variantStyles: Record<Variant, { container: ViewStyle; text: TextStyle }> = {
    primary: {
        container: { backgroundColor: colors.accent },
        text: { color: colors.text },
    },
    secondary: {
        container: { backgroundColor: colors.surface },
        text: { color: colors.text },
    },
    danger: {
        container: { backgroundColor: colors.danger },
        text: { color: colors.text },
    },
    ghost: {
        container: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border },
        text: { color: colors.text },
    },
};

const sizeStyles: Record<Size, ViewStyle> = {
    md: { paddingVertical: 12, paddingHorizontal: 16 },
    lg: { paddingVertical: 16, paddingHorizontal: 24 },
};

export default function Button({
    label,
    onPress,
    variant = "primary",
    size = "lg",
    disabled,
    style,
}: Props) {
    const v = variantStyles[variant];

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                {
                    borderRadius: radius.button,
                    minHeight: 44,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
                },
                v.container,
                sizeStyles[size],
                style,
            ]}
        >
            <AppText variant="body" style={[{ fontWeight: "600" }, v.text]}>
                {label}
            </AppText>
        </Pressable>
    );
}

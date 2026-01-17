/**
 * ScaleButton.web.tsx
 * Web-specific implementation: NO Reanimated import.
 * Uses simple Pressable with opacity feedback instead of scale animation.
 * This file is automatically resolved by webpack when Platform.OS === 'web'
 * due to resolve.extensions order: ['.web.tsx', '.tsx']
 */
import React from "react";
import { Pressable, StyleProp, ViewStyle, View, StyleSheet } from "react-native";

interface ScaleButtonProps {
    onPress: () => void;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    scaleAmount?: number; // Ignored on web, kept for API compatibility
    testID?: string;
}

const ScaleButton = ({
    onPress,
    children,
    style,
    testID,
}: ScaleButtonProps) => {
    return (
        <Pressable
            onPress={onPress}
            testID={testID}
            style={({ pressed }) => [
                style,
                pressed && styles.pressed,
            ]}
        >
            {children}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    pressed: {
        opacity: 0.7,
    },
});

export default ScaleButton;

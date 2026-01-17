import React from "react";
import { View } from "react-native";
import { spacing } from "../../theme/tokens";
import AppText from "./AppText";

type Props = {
    title: string;
    subtitle?: string;
};

export default function ScreenHeader({ title, subtitle }: Props) {
    return (
        <View style={{ marginBottom: spacing[24] }}>
            <AppText variant="screenTitle" style={{ marginBottom: spacing[4] }}>
                {title}
            </AppText>
            {subtitle ? <AppText variant="screenSubtitle">{subtitle}</AppText> : null}
        </View>
    );
}

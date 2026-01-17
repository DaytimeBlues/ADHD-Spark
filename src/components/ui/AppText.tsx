import React from "react";
import { Text, TextProps, TextStyle } from "react-native";
import { typography } from "../../theme/typography";

type Variant =
    | "screenTitle"
    | "screenSubtitle"
    | "sectionTitle"
    | "body"
    | "smallMuted"
    | "timer";

type Props = TextProps & {
    variant?: Variant;
    style?: TextStyle | TextStyle[];
};

export default function AppText({ variant = "body", style, ...props }: Props) {
    return <Text {...props} style={[typography[variant], style]} />;
}

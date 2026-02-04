import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Spacing, TypeScale, Radii } from '../../theme/tokens';

interface LinearCardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    style?: ViewStyle;
    headerStyle?: ViewStyle;
    footer?: React.ReactNode;
}

export const LinearCard: React.FC<LinearCardProps> = ({
    children,
    title,
    subtitle,
    style,
    headerStyle,
    footer,
}) => {
    return (
        <View style={[styles.container, style]}>
            {(title || subtitle) && (
                <View style={[styles.header, headerStyle]}>
                    {title && <Text style={styles.title}>{title}</Text>}
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
            )}
            <View style={styles.content}>
                {children}
            </View>
            {footer && <View style={styles.footer}>{footer}</View>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.neutral.darker,
        borderRadius: Radii.lg,
        borderWidth: 1,
        borderColor: Colors.neutral.borderSubtle,
        overflow: 'hidden',
    },
    header: {
        padding: Spacing[4],
        borderBottomWidth: 1,
        borderBottomColor: Colors.neutral.borderSubtle,
    },
    title: {
        fontFamily: 'Inter',
        fontWeight: '600',
        fontSize: TypeScale.base,
        color: Colors.text.primary,
        marginBottom: Spacing[1],
    },
    subtitle: {
        fontFamily: 'Inter',
        fontWeight: '400',
        fontSize: TypeScale.xs,
        color: Colors.text.secondary,
    },
    content: {
        padding: Spacing[4],
    },
    footer: {
        padding: Spacing[3],
        backgroundColor: Colors.neutral.darkest,
        borderTopWidth: 1,
        borderTopColor: Colors.neutral.borderSubtle,
    },
});

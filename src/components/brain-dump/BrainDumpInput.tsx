import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet, Platform, TextInputProps } from 'react-native';
import { LinearButton } from '../../components/ui/LinearButton';
import { Tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

export interface BrainDumpInputProps {
    onAdd: (text: string) => void;
}

export const BrainDumpInput: React.FC<BrainDumpInputProps> = ({ onAdd }) => {
    const { isCosmic } = useTheme();
    const styles = getStyles(isCosmic);
    const [input, setInput] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);

    const handleAdd = () => {
        if (input.trim()) {
            onAdd(input.trim());
            setInput('');
        }
    };

    return (
        <View style={styles.inputSection}>
            <View
                style={[
                    styles.inputWrapper,
                    isFocused && styles.inputWrapperFocused,
                ]}
            >
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder="> INPUT_DATA..."
                    placeholderTextColor={Tokens.colors.text.placeholder}
                    accessibilityLabel="Add a brain dump item"
                    accessibilityHint="Type a thought and press Add"
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={handleAdd}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    multiline={false}
                    returnKeyType="done"
                    blurOnSubmit
                />
            </View>
            <LinearButton
                title="+"
                onPress={handleAdd}
                size="lg"
                style={styles.addButton}
            />
        </View>
    );
};

const getStyles = (isCosmic: boolean) =>
    StyleSheet.create({
        inputSection: {
            flexDirection: 'row',
            marginBottom: isCosmic ? 16 : Tokens.spacing[5],
            gap: isCosmic ? 8 : Tokens.spacing[2],
            alignItems: 'center',
        },
        inputWrapper: {
            flex: 1,
            backgroundColor: isCosmic
                ? 'rgba(11, 16, 34, 0.8)'
                : Tokens.colors.neutral.darker,
            borderRadius: isCosmic ? 12 : Tokens.radii.none,
            borderWidth: 1,
            borderColor: isCosmic
                ? 'rgba(139, 92, 246, 0.25)'
                : Tokens.colors.neutral.border,
            minHeight: 48,
            justifyContent: 'center',
            ...(isCosmic
                ? Platform.select({
                    web: {
                        backdropFilter: 'blur(12px)',
                        boxShadow: `
              0 0 0 1px rgba(139, 92, 246, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.03),
              0 4px 16px rgba(7, 7, 18, 0.3)
            `,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                })
                : Platform.select({
                    web: { transition: 'all 0.2s ease' },
                })),
        },
        inputWrapperFocused: {
            borderColor: isCosmic
                ? 'rgba(139, 92, 246, 0.8)'
                : Tokens.colors.text.primary,
            ...(isCosmic
                ? Platform.select({
                    web: {
                        boxShadow: `
              0 0 0 2px rgba(139, 92, 246, 0.3),
              0 0 30px rgba(139, 92, 246, 0.25),
              inset 0 1px 0 rgba(255, 255, 255, 0.05)
            `,
                    },
                })
                : {}),
        },
        input: {
            paddingHorizontal: Tokens.spacing[3],
            color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
            fontFamily: Tokens.type.fontFamily.mono,
            fontSize: Tokens.type.sm,
            minHeight: 48,
            textAlignVertical: 'center',
            paddingVertical: 0,
            ...Platform.select({
                web: { outlineStyle: 'none' } as any,
            }),
        },
        addButton: {
            minHeight: 48,
            width: 60,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: isCosmic ? 8 : Tokens.radii.none,
        },
    });

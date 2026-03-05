import React, { memo, useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, ActivityIndicator } from 'react-native';
import { RuneButton } from '../../../ui/cosmic/RuneButton';
import { LoggerService } from '../../../services/LoggerService';
import { isWeb } from '../../../utils/PlatformUtils';
import { C } from '../CaptureStyles';

interface PasteModeProps {
    onCapture: (raw: string) => void;
    styles: any;
}

export const PasteMode = memo(function PasteMode({
    onCapture,
    styles,
}: PasteModeProps) {
    const [text, setText] = useState('');
    const [isPasting, setIsPasting] = useState(false);

    const handleAutoPaste = useCallback(async () => {
        setIsPasting(true);
        try {
            if (isWeb) {
                const webNavigator = navigator as any;
                if (webNavigator.clipboard) {
                    const pasted = await webNavigator.clipboard.readText();
                    setText(pasted);
                }
            }
        } catch (err) {
            LoggerService.error({
                service: 'CaptureDrawer',
                operation: 'handleAutoPaste',
                message: 'Clipboard read error',
                error: err,
            });
        } finally {
            setIsPasting(false);
        }
    }, []);

    useEffect(() => { handleAutoPaste(); }, [handleAutoPaste]);

    const handleConfirm = useCallback(() => {
        const trimmed = text.trim();
        if (!trimmed) return;
        onCapture(trimmed);
        setText('');
    }, [text, onCapture]);

    return (
        <View style={styles.modeContent}>
            {isPasting ? (
                <ActivityIndicator color={C.violet} size="small" />
            ) : (
                <>
                    <Text style={[styles.pasteHint, { color: C.mutedText }]}>
                        {text ? 'Edit before saving:' : 'Paste or type content:'}
                    </Text>
                    <TextInput
                        testID="capture-text-input"
                        style={[styles.textInput, { color: C.starlight, borderColor: C.border }]}
                        value={text}
                        onChangeText={setText}
                        placeholder="Paste text here…"
                        placeholderTextColor={C.mutedText}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        accessibilityLabel="Paste capture input"
                    />
                    <RuneButton
                        onPress={handleConfirm}
                        disabled={!text.trim()}
                        variant="primary"
                        style={styles.marginTop12}
                    >
                        SAVE TO INBOX
                    </RuneButton>
                </>
            )}
        </View>
    );
});

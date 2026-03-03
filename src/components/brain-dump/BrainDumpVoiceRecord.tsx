import React from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { Tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

export type RecordingState = 'idle' | 'recording' | 'processing';

export interface BrainDumpVoiceRecordProps {
  recordingState: RecordingState;
  recordingError: string | null;
  onRecordPress: () => void;
}

export const BrainDumpVoiceRecord: React.FC<BrainDumpVoiceRecordProps> = ({
  recordingState,
  recordingError,
  onRecordPress,
}) => {
  const { isCosmic } = useTheme();
  const styles = getStyles(isCosmic);

  return (
    <View style={styles.recordSection}>
      <Pressable
        testID="brain-dump-record-toggle"
        onPress={onRecordPress}
        disabled={recordingState === 'processing'}
        accessibilityRole="button"
        accessibilityLabel={
          recordingState === 'recording' ? 'Stop recording' : 'Start recording'
        }
        accessibilityHint="Records voice and converts it to a task item"
        style={({ pressed, hovered }: any) => [
          styles.recordButton,
          hovered && styles.recordButtonHovered,
          recordingState === 'recording' && styles.recordButtonActive,
          recordingState === 'processing' && styles.recordButtonProcessing,
          pressed && styles.recordButtonPressed,
        ]}
      >
        {recordingState === 'processing' ? (
          <ActivityIndicator size="small" color={Tokens.colors.text.primary} />
        ) : (
          <Text style={styles.recordIcon}>
            {recordingState === 'recording' ? '■' : '●'}
          </Text>
        )}
        <Text style={styles.recordText}>
          {recordingState === 'idle' && 'VOICE_INPUT'}
          {recordingState === 'recording' && 'STOP_REC'}
          {recordingState === 'processing' && 'PROCESSING...'}
        </Text>
      </Pressable>
      {recordingError && <Text style={styles.errorText}>{recordingError}</Text>}
    </View>
  );
};

const getStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    recordSection: {
      alignItems: 'center',
      marginBottom: isCosmic ? 16 : Tokens.spacing[5],
    },
    recordButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isCosmic
        ? 'rgba(17, 26, 51, 0.5)'
        : Tokens.colors.neutral.darkest,
      paddingHorizontal: isCosmic ? 12 : Tokens.spacing[3],
      paddingVertical: isCosmic ? 6 : Tokens.spacing[1],
      borderRadius: isCosmic ? 8 : Tokens.radii.none,
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(139, 92, 246, 0.3)'
        : Tokens.colors.neutral.border,
      minWidth: isCosmic ? 120 : 140,
      minHeight: isCosmic ? 36 : 48,
      justifyContent: 'center',
      ...(isCosmic
        ? Platform.select({
            web: {
              backdropFilter: 'blur(16px) saturate(180%)',
              boxShadow: `
              0 0 0 1px rgba(139, 92, 246, 0.2),
              0 4px 24px rgba(7, 7, 18, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.08)
            `,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
            },
          })
        : Platform.select({
            web: {
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            },
          })),
    },
    recordButtonHovered: {
      borderColor: isCosmic
        ? 'rgba(139, 92, 246, 0.6)'
        : Tokens.colors.text.primary,
      backgroundColor: isCosmic ? 'rgba(17, 26, 51, 0.7)' : undefined,
      ...(isCosmic
        ? Platform.select({
            web: {
              boxShadow: `
              0 0 0 2px rgba(139, 92, 246, 0.3),
              0 0 30px rgba(139, 92, 246, 0.25),
              0 8px 32px rgba(7, 7, 18, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
              transform: 'translateY(-1px)',
            },
          })
        : {}),
    },
    recordButtonActive: {
      backgroundColor: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
      borderColor: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
    },
    recordButtonProcessing: {
      opacity: 0.5,
      backgroundColor: Tokens.colors.neutral.dark,
    },
    recordButtonPressed: {
      opacity: 0.8,
    },
    recordIcon: {
      fontSize: Tokens.type.base,
      marginRight: Tokens.spacing[2],
      color: Tokens.colors.text.primary,
    },
    recordText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: Tokens.colors.text.primary,
      letterSpacing: 1,
    },
    errorText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: Tokens.colors.brand[500],
      textAlign: 'center',
      marginTop: Tokens.spacing[2],
    },
  });

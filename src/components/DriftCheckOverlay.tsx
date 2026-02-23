import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Tokens } from '../theme/tokens';
import { LinearButton } from './ui/LinearButton';
import { RuneButton } from '../ui/cosmic/RuneButton';
import { CosmicBackground } from '../ui/cosmic/CosmicBackground';
import { GlowCard } from '../ui/cosmic/GlowCard';
import CaptureService from '../services/CaptureService';

interface DriftCheckOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export const DriftCheckOverlay: React.FC<DriftCheckOverlayProps> = ({
  visible,
  onClose,
}) => {
  const { isCosmic } = useTheme();

  const [step, setStep] = useState<1 | 2>(1);
  const [doingNow, setDoingNow] = useState('');
  const [shouldDo, setShouldDo] = useState('');

  const handleNext = () => {
    if (doingNow.trim()) {
      setStep(2);
    }
  };

  const handleComplete = async () => {
    if (doingNow.trim() || shouldDo.trim()) {
      const log = `Drift Check:\n\nDoing: ${doingNow.trim() || 'N/A'}\n\nShould be doing: ${shouldDo.trim() || 'N/A'}`;
      await CaptureService.save({ raw: log, source: 'checkin' });
    }

    // Reset state and close
    setDoingNow('');
    setShouldDo('');
    setStep(1);
    onClose();
  };

  const styles = getStyles(isCosmic);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      hardwareAccelerated
      onRequestClose={() => {}}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.overlay}
        >
          {isCosmic && (
            <CosmicBackground variant="nebula" dimmer>
              <View />
            </CosmicBackground>
          )}

          <View style={styles.container}>
            <GlowCard
              glow="strong"
              tone="raised"
              padding="lg"
              style={styles.card}
            >
              <Text style={styles.alertText}>SYSTEM_INTERRUPT</Text>

              <Text style={styles.question}>
                {step === 1
                  ? 'What are you doing right now?'
                  : 'What SHOULD you be doing?'}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Type honestly..."
                placeholderTextColor={Tokens.colors.text.placeholder}
                value={step === 1 ? doingNow : shouldDo}
                onChangeText={step === 1 ? setDoingNow : setShouldDo}
                autoFocus
                onSubmitEditing={step === 1 ? handleNext : handleComplete}
                returnKeyType={step === 1 ? 'next' : 'done'}
                multiline={false}
              />

              <View style={styles.actions}>
                {isCosmic ? (
                  <RuneButton
                    variant="primary"
                    size="lg"
                    glow="strong"
                    onPress={step === 1 ? handleNext : handleComplete}
                    disabled={step === 1 ? !doingNow.trim() : !shouldDo.trim()}
                  >
                    {step === 1 ? 'LOG_STATE' : 'COMMIT_PIVOT'}
                  </RuneButton>
                ) : (
                  <LinearButton
                    title={step === 1 ? 'LOG STATE' : 'COMMIT PIVOT'}
                    onPress={step === 1 ? handleNext : handleComplete}
                    disabled={step === 1 ? !doingNow.trim() : !shouldDo.trim()}
                    size="lg"
                  />
                )}
              </View>
            </GlowCard>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const getStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: isCosmic ? 'rgba(7, 7, 18, 0.9)' : 'rgba(0, 0, 0, 0.85)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: '100%',
      maxWidth: 400,
      padding: Tokens.spacing[4],
    },
    card: {
      borderColor: isCosmic
        ? Tokens.colors.brand[500]
        : Tokens.colors.brand[500],
      borderWidth: 2,
    },
    alertText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: isCosmic ? Tokens.colors.brand[400] : Tokens.colors.brand[600],
      letterSpacing: 2,
      marginBottom: Tokens.spacing[4],
      textAlign: 'center',
    },
    question: {
      fontFamily: isCosmic ? 'Space Grotesk' : Tokens.type.fontFamily.sans,
      fontSize: Tokens.type['2xl'],
      fontWeight: '700',
      color: Tokens.colors.text.primary,
      marginBottom: Tokens.spacing[6],
      textAlign: 'center',
    },
    input: {
      backgroundColor: isCosmic ? '#0B1022' : Tokens.colors.neutral.darker,
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(139, 92, 246, 0.4)'
        : Tokens.colors.neutral.border,
      borderRadius: isCosmic ? 8 : 4,
      padding: Tokens.spacing[4],
      color: Tokens.colors.text.primary,
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.base,
      marginBottom: Tokens.spacing[8],
      ...Platform.select({
        web: { outlineStyle: 'none' },
      }),
    },
    actions: {
      alignItems: 'center',
    },
  });

/**
 * CaptureDrawer
 *
 * Bottom sheet drawer with 5 capture modes:
 * voice | text | photo | paste | meeting
 *
 * Opens via CaptureBubble FAB. Each mode saves a CaptureItem
 * to the inbox via CaptureService.
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { BottomSheet } from '../../ui/cosmic/BottomSheet';
import type { CaptureSource } from '../../services/CaptureService';
import { useCaptureDrawer, DrawerMode } from '../../hooks/useCaptureDrawer';
import {
  VoiceMode,
  TextMode,
  PasteMode,
  MeetingMode,
  PhotoMode,
  CheckInMode,
  TaskMode,
} from './CaptureModes';
import type { BubbleState } from './CaptureBubble';
import { isWeb } from '../../utils/PlatformUtils';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

export interface CaptureDrawerProps {
  visible: boolean;
  onClose: () => void;
  onStateChange: (state: BubbleState) => void;
  currentBubbleState: BubbleState;
}

const MODES: Array<{ id: DrawerMode; icon: string; label: string }> = [
  { id: 'task', icon: '📝', label: 'TASK' },
  { id: 'voice', icon: '🎙', label: 'VOICE' },
  { id: 'text', icon: '⌨', label: 'TEXT' },
  { id: 'photo', icon: '📷', label: 'PHOTO' },
  { id: 'paste', icon: '📋', label: 'PASTE' },
  { id: 'meeting', icon: '👥', label: 'MEETING' },
  { id: 'checkin', icon: '🎯', label: 'CHECK-IN' },
];

// Cosmic colors
const C = {
  violet: '#8B5CF6',
  teal: '#2DD4BF',
  rose: '#FB7185',
  gold: '#F6C177',
  starlight: '#EEF2FF',
  mist: '#B9C2D9',
  mutedText: 'rgba(238,242,255,0.56)',
  activeModeTab: 'rgba(139, 92, 246, 0.15)',
} as const;

// ============================================================================
// MAIN DRAWER
// ============================================================================

export const CaptureDrawer = memo(function CaptureDrawer(
  props: CaptureDrawerProps,
) {
  const { visible, onClose, onStateChange, currentBubbleState } = props;
  const {
    activeMode,
    setActiveMode,
    successMsg,
    saveError,
    isSaving,
    showSuccess,
    handleVoiceCapture,
    handleTextCapture,
    handlePasteCapture,
    handleMeetingCapture,
    handleCheckInCapture,
    handlePhotoCapture,
  } = useCaptureDrawer(props);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="CAPTURE"
      testID="capture-drawer"
      maxHeightFraction={0.85}
      scrollable={false}
    >
      {/* Success flash */}
      {successMsg !== '' && (
        <View style={styles.successBanner}>
          <Text style={[styles.successText, { color: C.teal }]}>
            {successMsg}
          </Text>
        </View>
      )}

      {/* Error banner */}
      {saveError !== null && (
        <View style={[styles.successBanner, styles.errorBanner]}>
          <Text style={[styles.successText, { color: C.rose }]}>
            {saveError}
          </Text>
        </View>
      )}

      {/* Loading overlay */}
      {isSaving && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={C.violet} />
          <Text style={[styles.loadingText, { color: C.mutedText }]}>
            Saving...
          </Text>
        </View>
      )}

      {/* Mode tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.modeTabsScroll}
        contentContainerStyle={styles.modeTabsContent}
      >
        {MODES.map((mode) => (
          <Pressable
            key={mode.id}
            testID={`capture-mode-${mode.id}`}
            style={[
              styles.modeTab,
              activeMode === mode.id && {
                backgroundColor: C.activeModeTab,
                borderColor: C.violet,
              },
            ]}
            onPress={() => !isSaving && setActiveMode(mode.id)}
            accessibilityLabel={`${mode.label} capture mode`}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeMode === mode.id }}
          >
            <Text style={styles.modeTabIcon}>{mode.icon}</Text>
            <Text
              style={[
                styles.modeTabLabel,
                { color: activeMode === mode.id ? C.violet : C.mutedText },
              ]}
            >
              {mode.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Active mode content */}
      <View style={styles.modePanel}>
        {activeMode === 'task' && (
          <TaskMode
            styles={styles}
            onSuccess={() => showSuccess('Task added ✓')}
          />
        )}
        {activeMode === 'voice' && (
          <VoiceMode
            styles={styles}
            onCapture={handleVoiceCapture}
            onStateChange={onStateChange}
          />
        )}
        {activeMode === 'text' && (
          <TextMode styles={styles} onCapture={handleTextCapture} />
        )}
        {activeMode === 'paste' && (
          <PasteMode styles={styles} onCapture={handlePasteCapture} />
        )}
        {activeMode === 'meeting' && (
          <MeetingMode styles={styles} onCapture={handleMeetingCapture} />
        )}
        {activeMode === 'checkin' && (
          <CheckInMode styles={styles} onCapture={handleCheckInCapture} />
        )}
        {activeMode === 'photo' && (
          <PhotoMode styles={styles} onCapture={handlePhotoCapture} />
        )}
      </View>

      {/* Offline banner */}
      {currentBubbleState === 'offline' && (
        <View style={styles.offlineBanner}>
          <Text style={[styles.offlineText, { color: C.gold }]}>
            ⊗ Offline — captures will sync when reconnected
          </Text>
        </View>
      )}
    </BottomSheet>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Common spacers
  marginTop12: {
    marginTop: 12,
  },

  // Mode tabs
  modeTabsScroll: {
    maxHeight: 64,
  },
  modeTabsContent: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  modeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(185, 194, 217, 0.15)',
    gap: 5,
  },
  modeTabIcon: {
    fontSize: 14,
  },
  modeTabLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  // Mode panel
  modePanel: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  modeContent: {
    flex: 1,
  },

  // Voice mode
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
    borderRadius: 14,
    marginTop: 8,
  },
  recordBtnIcon: {
    fontSize: 22,
  },
  recordingActive: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  recordingIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  recordingTime: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  recordingHint: {
    fontSize: 12,
    letterSpacing: 1,
  },
  stopBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  processingState: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 12,
  },
  processingText: {
    fontSize: 13,
    letterSpacing: 1,
  },
  transcriptContainer: {
    gap: 10,
    paddingTop: 8,
  },
  transcriptLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  transcriptText: {
    fontSize: 15,
    lineHeight: 22,
  },
  confirmRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },

  // Shared confirm/discard
  confirmBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  discardBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
  },

  // Error / retry
  errorState: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  // Text input
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    backgroundColor: 'rgba(7, 7, 18, 0.4)',
  },
  textInputMeeting: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 160,
    backgroundColor: 'rgba(7, 7, 18, 0.4)',
    lineHeight: 22,
  },

  // Paste mode
  pasteHint: {
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  // Meeting mode
  meetingLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  // Photo mode
  photoPickBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 8,
    marginTop: 8,
  },
  photoPickIcon: {
    fontSize: 32,
  },
  photoPickLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  photoPickHint: {
    fontSize: 11,
    textAlign: 'center',
  },
  photoPreview: {
    gap: 10,
  },
  photoPreviewLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
  },

  // Check-in specific
  checkInPrompt: {
    color: '#EEF2FF',
    marginBottom: 8,
    fontSize: 16,
    lineHeight: 22,
  },

  // Success banner
  successBanner: {
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
  },

  errorBanner: {
    backgroundColor: 'rgba(251, 113, 133, 0.15)',
  },

  successText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Offline banner
  offlineBanner: {
    marginHorizontal: 20,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(246, 193, 119, 0.12)',
  },

  offlineText: {
    fontSize: 12,
    letterSpacing: 0.5,
  },

  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 7, 18, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    gap: 8,
  },

  loadingText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});

export default CaptureDrawer;

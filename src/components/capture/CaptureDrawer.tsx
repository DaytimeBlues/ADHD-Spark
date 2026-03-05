import React, { memo } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { BottomSheet } from '../../ui/cosmic/BottomSheet';
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
import { styles, C } from './CaptureStyles';

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

export default CaptureDrawer;

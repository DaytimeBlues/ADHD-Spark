/**
 * InboxScreen
 *
 * Triage screen for captured items. Every capture lands here before being
 * promoted to a task/note or discarded. Supports filter tabs:
 * All | Unreviewed | Promoted | Discarded
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Tokens } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import type {
  CaptureItem,
} from '../services/CaptureService';
import { CosmicBackground } from '../ui/cosmic';
import { useInbox, FilterTab } from '../hooks/useInbox';
import {
  FILTER_TABS,
  CaptureSkeleton,
  CaptureRow,
} from '../components/inbox/InboxComponents';

// ============================================================================
// SCREEN
// ============================================================================

const InboxScreen = (): JSX.Element => {
  const navigation = useNavigation();
  const { isCosmic } = useTheme();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const {
    items,
    isLoading,
    handlePromoteTask,
    handlePromoteNote,
    handleDiscard,
  } = useInbox(activeFilter);

  const renderItem = useCallback(
    ({ item }: { item: CaptureItem }) => (
      <CaptureRow
        item={item}
        onPromoteTask={handlePromoteTask}
        onPromoteNote={handlePromoteNote}
        onDiscard={handleDiscard}
        isCosmic={isCosmic}
        styles={styles}
      />
    ),
    [handlePromoteTask, handlePromoteNote, handleDiscard, isCosmic],
  );

  return (
    <CosmicBackground variant="ridge" style={StyleSheet.absoluteFill}>
      <SafeAreaView
        style={[styles.container, isCosmic ? styles.bgCosmic : styles.bgLinear]}
        testID="inbox-screen"
      >
        {/* Header */}
        <View style={[styles.header, isCosmic && styles.headerCosmic]}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.closeBtn}
            testID="inbox-close"
            accessibilityLabel="Close inbox"
          >
            <Text
              style={[
                styles.closeBtnText,
                isCosmic && styles.closeBtnTextCosmic,
              ]}
            >
              ✕
            </Text>
          </Pressable>
          <Text style={[styles.title, isCosmic && styles.titleCosmic]}>
            CAPTURE INBOX
          </Text>
          <View style={styles.closeBtnPlaceholder} />
        </View>

        {/* Filter tabs */}
        <View
          style={[styles.tabs, isCosmic && styles.tabsCosmic]}
          testID="inbox-filter-tabs"
        >
          {FILTER_TABS.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveFilter(tab.key)}
              style={[
                styles.tab,
                activeFilter === tab.key &&
                (isCosmic ? styles.tabActiveCosmic : styles.tabActiveLinear),
              ]}
              testID={`inbox-tab-${tab.key}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeFilter === tab.key }}
            >
              <Text
                style={[
                  styles.tabText,
                  isCosmic && styles.tabTextCosmic,
                  activeFilter === tab.key &&
                  (isCosmic
                    ? styles.tabTextActiveCosmic
                    : styles.tabTextActiveLinear),
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={styles.listContent}>
            {[1, 2, 3].map((key) => (
              <CaptureSkeleton key={key} isCosmic={isCosmic} styles={styles} />
            ))}
          </View>
        ) : items.length === 0 ? (
          <View style={styles.centered} testID="inbox-empty">
            <Text
              style={[styles.emptyText, isCosmic && styles.emptyTextCosmic]}
            >
              {activeFilter === 'unreviewed'
                ? 'Nothing to review.\nCapture something with the bubble!'
                : 'No items here yet.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            testID="inbox-list"
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </CosmicBackground>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Skeleton styles
  skeletonBgLinear: {
    backgroundColor: Tokens.colors.neutral.darker,
    borderColor: Tokens.colors.neutral.borderSubtle,
  },
  skeletonBgCosmic: {
    backgroundColor: 'rgba(17, 26, 51, 0.4)',
    borderColor: 'rgba(185, 194, 217, 0.08)',
  },
  skeletonBlockLinear: {
    backgroundColor: Tokens.colors.neutral[500],
  },
  skeletonBlockCosmic: {
    backgroundColor: 'rgba(185, 194, 217, 0.2)',
  },
  skeletonBadge: {
    width: 60,
    height: 16,
    borderRadius: 4,
  },
  skeletonTime: {
    width: 40,
    height: 12,
    borderRadius: 4,
  },
  skeletonContent: {
    marginVertical: 4,
  },
  skeletonText: {
    height: 12,
    borderRadius: 4,
  },
  w90: {
    width: '90%',
    marginBottom: 8,
  },
  w60: {
    width: '60%',
  },
  skeletonBtn: {
    width: 70,
    height: 28,
    borderRadius: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Tokens.spacing[4],
    paddingVertical: Tokens.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Tokens.colors.neutral.borderSubtle,
  },
  headerCosmic: {
    borderBottomColor: 'rgba(185, 194, 217, 0.12)',
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    color: Tokens.colors.text.secondary,
  },
  closeBtnTextCosmic: {
    color: '#B9C2D9',
  },
  closeBtnPlaceholder: {
    width: 44,
  },
  title: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.base,
    fontWeight: '700',
    color: Tokens.colors.text.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    ...Platform.select({
      web: { textShadow: 'none' } as object,
    }),
  },
  titleCosmic: {
    color: '#EEF2FF',
    fontFamily: 'Space Grotesk',
    ...Platform.select({
      web: {
        textShadow: '0 0 16px rgba(139, 92, 246, 0.3)',
      } as object,
    }),
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Tokens.colors.neutral.borderSubtle,
    backgroundColor: Tokens.colors.neutral.darker,
  },
  tabsCosmic: {
    backgroundColor: '#0B1022',
    borderBottomColor: 'rgba(42, 53, 82, 0.3)',
  },
  tab: {
    flex: 1,
    paddingVertical: Tokens.spacing[3],
    alignItems: 'center',
  },
  tabActiveLinear: {
    borderBottomWidth: 2,
    borderBottomColor: Tokens.colors.indigo.primary,
  },
  tabActiveCosmic: {
    borderBottomWidth: 2,
    borderBottomColor: '#8B5CF6',
  },
  tabText: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.xs,
    fontWeight: '600',
    color: Tokens.colors.text.tertiary,
    letterSpacing: 0.5,
  },
  tabTextCosmic: {
    color: '#6B7A9C',
  },
  tabTextActiveLinear: {
    color: Tokens.colors.indigo.primary,
  },
  tabTextActiveCosmic: {
    color: '#8B5CF6',
  },
  listContent: {
    padding: Tokens.spacing[4],
    gap: Tokens.spacing[3],
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Tokens.spacing[8],
  },
  emptyText: {
    fontFamily: Tokens.type.fontFamily.body,
    fontSize: Tokens.type.base,
    color: Tokens.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyTextCosmic: {
    color: '#6B7A9C',
  },
  // Row
  row: {
    borderRadius: 8,
    padding: Tokens.spacing[4],
    borderWidth: 1,
    gap: Tokens.spacing[3],
  },
  rowLinear: {
    backgroundColor: Tokens.colors.neutral.darker,
    borderColor: Tokens.colors.neutral.borderSubtle,
  },
  rowCosmic: {
    backgroundColor: 'rgba(17, 26, 51, 0.7)',
    borderColor: 'rgba(185, 194, 217, 0.12)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
        boxShadow:
          '0 0 0 1px rgba(139, 92, 246, 0.06), 0 4px 16px rgba(7, 7, 18, 0.3)',
      } as object,
    }),
  },
  rowReviewed: {
    opacity: 0.65,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing[2],
    flexWrap: 'wrap',
  },
  sourceBadge: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    fontWeight: '600',
    color: Tokens.colors.brand[500],
    backgroundColor: Tokens.colors.neutral.dark,
    paddingHorizontal: Tokens.spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  sourceBadgeCosmic: {
    color: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  timestamp: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    color: Tokens.colors.text.tertiary,
  },
  timestampCosmic: {
    color: '#6B7A9C',
  },
  statusBadge: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: Tokens.spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    letterSpacing: 0.5,
  },
  statusBadgePromotedLinear: {
    color: Tokens.colors.success.main,
    backgroundColor: Tokens.colors.success.subtle,
  },
  statusBadgePromotedCosmic: {
    color: '#2DD4BF',
    backgroundColor: 'rgba(45, 212, 191, 0.12)',
  },
  statusBadgeDiscardedLinear: {
    color: Tokens.colors.error.main,
    backgroundColor: Tokens.colors.error.subtle,
  },
  statusBadgeDiscardedCosmic: {
    color: '#FB7185',
    backgroundColor: 'rgba(251, 113, 133, 0.1)',
  },
  rawText: {
    fontFamily: Tokens.type.fontFamily.body,
    fontSize: Tokens.type.sm,
    color: Tokens.colors.text.primary,
    lineHeight: 20,
  },
  rawTextCosmic: {
    color: '#B9C2D9',
  },
  actions: {
    flexDirection: 'row',
    gap: Tokens.spacing[2],
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingHorizontal: Tokens.spacing[3],
    paddingVertical: Tokens.spacing[1],
    borderRadius: 6,
    borderWidth: 1,
  },
  actionBtnPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
  actionBtnTaskLinear: {
    borderColor: Tokens.colors.indigo.primary,
    backgroundColor: Tokens.colors.indigo.subtle,
  },
  actionBtnTaskCosmic: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
  },
  actionBtnNoteLinear: {
    borderColor: Tokens.colors.brand[400],
    backgroundColor: 'transparent',
  },
  actionBtnNoteCosmic: {
    borderColor: '#B9C2D9',
    backgroundColor: 'rgba(185, 194, 217, 0.08)',
  },
  actionBtnDiscardLinear: {
    borderColor: Tokens.colors.error.main,
    backgroundColor: 'transparent',
  },
  actionBtnDiscardCosmic: {
    borderColor: 'rgba(251, 113, 133, 0.4)',
    backgroundColor: 'transparent',
  },
  actionBtnText: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.xs,
    fontWeight: '600',
    color: Tokens.colors.text.primary,
    letterSpacing: 0.3,
  },
  actionBtnTextCosmic: {
    color: '#EEF2FF',
  },
  actionBtnTextDiscard: {
    color: Tokens.colors.error.main,
  },
  bgCosmic: {
    backgroundColor: '#070712',
  },
  bgLinear: {
    backgroundColor: Tokens.colors.neutral.darkest,
  },
});

export default InboxScreen;

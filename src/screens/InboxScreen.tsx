import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/useTheme';
import type { CaptureItem } from '../services/CaptureService';
import { CosmicBackground } from '../ui/cosmic';
import { useInbox, FilterTab } from '../hooks/useInbox';
import {
  FILTER_TABS,
  CaptureSkeleton,
  CaptureRow,
} from '../components/inbox/InboxComponents';
import { styles } from './InboxStyles';

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
        <View style={[styles.header, isCosmic && styles.headerCosmic]}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.closeBtn}
            testID="inbox-close"
            accessibilityLabel="Close inbox"
          >
            <Text style={[styles.closeBtnText, isCosmic && styles.closeBtnTextCosmic]}>
              ✕
            </Text>
          </Pressable>
          <Text style={[styles.title, isCosmic && styles.titleCosmic]}>
            CAPTURE INBOX
          </Text>
          <View style={styles.closeBtnPlaceholder} />
        </View>

        <View style={[styles.tabs, isCosmic && styles.tabsCosmic]} testID="inbox-filter-tabs">
          {FILTER_TABS.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveFilter(tab.key)}
              style={[
                styles.tab,
                activeFilter === tab.key && (isCosmic ? styles.tabActiveCosmic : styles.tabActiveLinear),
              ]}
              testID={`inbox-tab-${tab.key}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeFilter === tab.key }}
            >
              <Text
                style={[
                  styles.tabText,
                  isCosmic && styles.tabTextCosmic,
                  activeFilter === tab.key && (isCosmic ? styles.tabTextActiveCosmic : styles.tabTextActiveLinear),
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.listContent}>
            {[1, 2, 3].map((key) => (
              <CaptureSkeleton key={key} isCosmic={isCosmic} styles={styles} />
            ))}
          </View>
        ) : items.length === 0 ? (
          <View style={styles.centered} testID="inbox-empty">
            <Text style={[styles.emptyText, isCosmic && styles.emptyTextCosmic]}>
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

export default InboxScreen;

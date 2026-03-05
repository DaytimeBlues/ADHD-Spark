import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Tokens } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { CosmicBackground } from '../ui/cosmic';
import { isWeb } from '../utils/PlatformUtils';
import {
  BrainDumpItem,
  BrainDumpInput,
  BrainDumpActionBar,
  BrainDumpRationale,
  BrainDumpGuide,
  BrainDumpVoiceRecord,
  IntegrationPanel,
} from '../components/brain-dump';
import useBrainDump from '../hooks/useBrainDump';
import type { SortedItem } from '../services/AISortService';

type BrainDumpRouteParams = {
  autoRecord?: boolean;
};

type BrainDumpRoute = RouteProp<Record<'Tasks', BrainDumpRouteParams>, 'Tasks'>;

const BrainDumpScreen = () => {
  const { isCosmic } = useTheme();
  const styles = getStyles(isCosmic);
  const route = useRoute<BrainDumpRoute>();

  const {
    items,
    recordingState,
    recordingError,
    isSorting,
    isLoading,
    sortingError,
    sortedItems,
    googleAuthRequired,
    isConnectingGoogle,
    showGuide,
    groupedSortedItems,
    addItem,
    deleteItem,
    clearAll,
    handleRecordPress,
    handleAISort,
    handleConnectGoogle,
    dismissGuide,
    getPriorityStyle,
  } = useBrainDump(route.params?.autoRecord);

  return (
    <SafeAreaView style={styles.container}>
      {isCosmic && (
        <CosmicBackground variant="nebula">
          <View style={StyleSheet.absoluteFill} />
        </CosmicBackground>
      )}
      <View style={styles.centerContainer}>
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <Text style={styles.title}>BRAIN_DUMP</Text>
            <View style={styles.headerLine} />
          </View>

          <BrainDumpRationale />

          <BrainDumpInput onAdd={addItem} />

          <BrainDumpGuide showGuide={showGuide} onDismiss={dismissGuide} />

          <BrainDumpVoiceRecord
            recordingState={recordingState}
            recordingError={recordingError}
            onRecordPress={handleRecordPress}
          />

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="small"
                color={Tokens.colors.brand[500]}
              />
              <Text style={styles.loadingText}>LOADING...</Text>
            </View>
          ) : (
            <BrainDumpActionBar
              itemCount={items.length}
              isSorting={isSorting}
              onSort={handleAISort}
              onClear={clearAll}
            />
          )}

          {sortingError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{sortingError}</Text>
              {googleAuthRequired && !isWeb && (
                <Pressable
                  onPress={handleConnectGoogle}
                  disabled={isConnectingGoogle}
                  style={({ pressed }) => [
                    styles.connectButton,
                    isConnectingGoogle && styles.connectButtonDisabled,
                    pressed && styles.connectButtonPressed,
                  ]}
                >
                  <Text style={styles.connectButtonText}>
                    {isConnectingGoogle ? 'CONNECTING...' : 'CONNECT GOOGLE'}
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Integration Panel */}
          <IntegrationPanel />

          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BrainDumpItem item={item} onDelete={deleteItem} />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              !isLoading ? (
                <Text style={[styles.title, styles.emptyState]}>
                  _AWAITING_INPUT
                </Text>
              ) : null
            }
            ListFooterComponent={
              sortedItems.length > 0 ? (
                <View style={styles.sortedSection}>
                  <Text style={styles.sortedHeader}>AI_SUGGESTIONS</Text>
                  {groupedSortedItems.map(({ category, items: catItems }) => (
                    <View key={category} style={styles.categorySection}>
                      <Text style={styles.categoryTitle}>{category}</Text>
                      {catItems.map((item: SortedItem, idx: number) => (
                        <View key={idx} style={styles.sortedItemRow}>
                          <Text style={styles.sortedItemText}>
                            {item.duration ? `[${item.duration}] ` : ''}
                            {item.text}
                          </Text>
                          <View
                            style={[
                              styles.priorityBadge,
                              getPriorityStyle(item.priority),
                            ]}
                          >
                            <Text style={styles.priorityText}>
                              {item.priority}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              ) : null
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isCosmic ? '#070712' : Tokens.colors.neutral.darkest,
    },
    centerContainer: {
      flex: 1,
      alignItems: 'center',
      zIndex: 1,
    },
    contentWrapper: {
      flex: 1,
      width: '100%',
      maxWidth: Tokens.layout.maxWidth.content,
      padding: Tokens.spacing[4],
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: isCosmic ? 16 : Tokens.spacing[5],
      marginTop: Tokens.spacing[4],
    },
    title: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.sm,
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      fontWeight: '700',
      letterSpacing: 2,
    },
    headerLine: {
      flex: 1,
      height: 1,
      backgroundColor: isCosmic
        ? 'rgba(139, 92, 246, 0.3)'
        : Tokens.colors.neutral.border,
      marginLeft: Tokens.spacing[4],
    },
    loadingContainer: {
      padding: Tokens.spacing[8],
      alignItems: 'center',
      gap: Tokens.spacing[4],
    },
    loadingText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.sm,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    errorContainer: {
      marginTop: Tokens.spacing[2],
      marginBottom: Tokens.spacing[4],
      alignItems: 'center',
    },
    errorText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: Tokens.colors.brand[500],
      textAlign: 'center',
    },
    connectButton: {
      marginTop: Tokens.spacing[3],
      backgroundColor: Tokens.colors.indigo.primary,
      paddingHorizontal: Tokens.spacing[4],
      paddingVertical: Tokens.spacing[2],
      borderRadius: Tokens.radii.md,
    },
    connectButtonPressed: {
      opacity: 0.8,
    },
    connectButtonDisabled: {
      opacity: 0.6,
    },
    connectButtonText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: Tokens.colors.text.primary,
      fontWeight: '700',
    },
    emptyState: {
      marginTop: Tokens.spacing[12],
      opacity: 0.3,
    },
    listContent: {
      paddingBottom: 120,
    },
    sortedSection: {
      marginTop: Tokens.spacing[6],
      paddingTop: Tokens.spacing[4],
      borderTopWidth: 1,
      borderTopColor: isCosmic
        ? 'rgba(139, 92, 246, 0.2)'
        : Tokens.colors.neutral.border,
    },
    sortedHeader: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.sm,
      color: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
      marginBottom: Tokens.spacing[4],
      letterSpacing: 1,
    },
    categorySection: {
      marginBottom: Tokens.spacing[4],
    },
    categoryTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      textTransform: 'uppercase',
      marginBottom: Tokens.spacing[2],
      backgroundColor: isCosmic
        ? 'rgba(139, 92, 246, 0.1)'
        : Tokens.colors.neutral.dark,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      alignSelf: 'flex-start',
    },
    sortedItemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: 4,
      marginBottom: 0,
    },
    sortedItemText: {
      flex: 1,
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
      lineHeight: Tokens.type.sm * 1.5,
      marginRight: Tokens.spacing[3],
    },
    priorityBadge: {
      paddingHorizontal: 6,
      paddingVertical: 0,
      borderRadius: isCosmic ? 4 : Tokens.radii.none,
      minWidth: 40,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(185, 194, 217, 0.12)'
        : Tokens.colors.neutral.border,
    },
    priorityText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xxs,
      fontWeight: '700',
      textTransform: 'uppercase',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
    },
  });

export default BrainDumpScreen;

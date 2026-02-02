import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
  Pressable,
} from 'react-native';
import StorageService from '../services/StorageService';
import OverlayService from '../services/OverlayService';
import {generateId} from '../utils/helpers';
// We remove MetroButton to use a custom button aligned with new design
import { Tokens } from '../theme/tokens';

const INPUT_HEIGHT = Tokens.spacing[32] + Tokens.spacing[24];
const HIT_SLOP = {
  top: Tokens.spacing[12],
  bottom: Tokens.spacing[12],
  left: Tokens.spacing[12],
  right: Tokens.spacing[12],
};
const ITEM_BORDER_WIDTH = Tokens.spacing[4];
const ITEM_LINE_HEIGHT = Tokens.spacing[24];

interface DumpItem {
  id: string;
  text: string;
  createdAt: string;
}

const BrainDumpScreen = () => {
  const [input, setInput] = useState('');
  const [items, setItems] = useState<DumpItem[]>([]);

  // On web, layout animation is CSS based usually, but we keep RN logic for now
  
  const loadItems = async () => {
    const storedItems = await StorageService.getJSON<DumpItem[]>(
      StorageService.STORAGE_KEYS.brainDump,
    );
    if (!storedItems || !Array.isArray(storedItems)) {
      return;
    }

    const normalized = storedItems.filter(item => {
      return Boolean(item?.id && item?.text && item?.createdAt);
    });
    
    // Animate initial load
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItems(normalized);
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
    loadItems();
  }, []);

  useEffect(() => {
    StorageService.setJSON(StorageService.STORAGE_KEYS.brainDump, items);
    OverlayService.updateCount(items.length);
  }, [items]);

  const addItem = () => {
    if (input.trim()) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const newItem: DumpItem = {
        id: generateId(),
        text: input.trim(),
        createdAt: new Date().toISOString(),
      };
      setItems(prevItems => [newItem, ...prevItems]);
      setInput('');
    }
  };

  const deleteItem = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const clearAll = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItems([]);
  };

  const renderItem = ({item}: {item: DumpItem}) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.text}</Text>
      <TouchableOpacity 
        onPress={() => deleteItem(item.id)}
        style={styles.deleteButton}
        hitSlop={HIT_SLOP}
      >
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContainer}>
        <View style={[styles.contentWrapper, { maxWidth: Tokens.layout.maxWidth.prose }]}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Brain Dump</Text>
            <Text style={styles.subtitle}>Unload your thoughts. We'll keep them safe.</Text>
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="What's on your mind?"
                placeholderTextColor={Tokens.colors.neutral[400]}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={addItem}
                multiline
                // Web specific
                {...(Platform.OS === 'web' ? { style: [styles.input, { outlineWidth: 0 }] } : {})}
              />
            </View>
            <Pressable 
              style={({pressed}) => [
                styles.addButton,
                pressed && { opacity: 0.8, transform: [{scale: 0.98}] }
              ]}
              onPress={addItem}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          </View>

          {items.length > 0 && (
            <View style={styles.actionsBar}>
              <Text style={styles.countText}>{items.length} items</Text>
              <TouchableOpacity onPress={clearAll}>
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          )}

          <FlatList
            data={items}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>☁️</Text>
                <Text style={styles.emptyText}>
                  Your mind is clear... for now.
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral[900],
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    padding: Tokens.spacing[16],
  },
  header: {
    marginBottom: Tokens.spacing[32],
    marginTop: Tokens.spacing[16],
  },
  title: {
    fontSize: Tokens.type['4xl'],
    fontWeight: '700',
    color: Tokens.colors.neutral[0],
    marginBottom: Tokens.spacing[8],
  },
  subtitle: {
    fontSize: Tokens.type.base,
    color: Tokens.colors.neutral[400],
  },
  // Input
  inputSection: {
    flexDirection: 'row',
    marginBottom: Tokens.spacing[24],
    gap: Tokens.spacing[12],
    // For older RN fallback if gap not supported
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral[800],
    borderRadius: Tokens.radii.lg,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral[700],
    minHeight: INPUT_HEIGHT, // Touch target friendly
    justifyContent: 'center',
  },
  input: {
    padding: Tokens.spacing[16],
    color: Tokens.colors.neutral[50],
    fontSize: Tokens.type.base,
    minHeight: INPUT_HEIGHT,
    textAlignVertical: 'center', // Android
  },
  addButton: {
    backgroundColor: Tokens.colors.brand[600],
    borderRadius: Tokens.radii.lg,
    paddingHorizontal: Tokens.spacing[24],
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: INPUT_HEIGHT,
    ...Tokens.elevation.sm,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  addButtonText: {
    color: Tokens.colors.neutral[0],
    fontWeight: '600',
    fontSize: Tokens.type.base,
  },
  // Actions
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Tokens.spacing[16],
    paddingHorizontal: Tokens.spacing[4],
  },
  countText: {
    color: Tokens.colors.neutral[500],
    fontSize: Tokens.type.sm,
  },
  clearText: {
    color: Tokens.colors.danger[200], // Softer red for dark mode
    fontSize: Tokens.type.sm,
    fontWeight: '600',
  },
  // List
  listContent: {
    paddingBottom: Tokens.spacing[64],
  },
  item: {
    backgroundColor: Tokens.colors.neutral[800],
    borderRadius: Tokens.radii.md,
    padding: Tokens.spacing[16],
    marginBottom: Tokens.spacing[12],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: ITEM_BORDER_WIDTH,
    borderLeftColor: Tokens.colors.brand[500],
    ...Tokens.elevation.sm,
  },
  itemText: {
    flex: 1,
    color: Tokens.colors.neutral[100],
    fontSize: Tokens.type.base,
    lineHeight: ITEM_LINE_HEIGHT,
    marginRight: Tokens.spacing[16],
  },
  deleteButton: {
    padding: Tokens.spacing[8],
  },
  deleteText: {
    color: Tokens.colors.neutral[500],
    fontSize: Tokens.type.lg,
  },
  // Empty
  emptyState: {
    alignItems: 'center',
    marginTop: Tokens.spacing[48],
    opacity: 0.5,
  },
  emptyIcon: {
    fontSize: Tokens.type.mega,
    marginBottom: Tokens.spacing[16],
    color: Tokens.colors.neutral[700],
  },
  emptyText: {
    color: Tokens.colors.neutral[400],
    fontSize: Tokens.type.lg,
  },
});

export default BrainDumpScreen;

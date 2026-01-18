import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';

interface DumpItem {
  id: string;
  text: string;
  createdAt: Date;
}

const BrainDumpScreen = () => {
  const [input, setInput] = useState('');
  const [items, setItems] = useState<DumpItem[]>([]);

  const addItem = () => {
    if (input.trim()) {
      const newItem: DumpItem = {
        id: Date.now().toString(),
        text: input.trim(),
        createdAt: new Date(),
      };
      setItems([newItem, ...items]);
      setInput('');
    }
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const clearAll = () => {
    setItems([]);
  };

  const renderItem = ({item}: {item: DumpItem}) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.text}</Text>
      <TouchableOpacity onPress={() => deleteItem(item.id)}>
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Brain Dump</Text>
        <Text style={styles.subtitle}>Clear your mind, capture everything</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            placeholderTextColor="#666"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={addItem}
            multiline
          />
          <TouchableOpacity style={styles.addButton} onPress={addItem}>
            <Text style={styles.addButtonText}>Dump</Text>
          </TouchableOpacity>
        </View>

        {items.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Your brain is empty... for now
            </Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#2D2D44',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 12,
    minHeight: 50,
  },
  addButton: {
    backgroundColor: '#6200EA',
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  clearButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
  },
  listContent: {
    flexGrow: 1,
  },
  item: {
    backgroundColor: '#2D2D44',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  deleteText: {
    color: '#FF6B6B',
    fontSize: 18,
    marginLeft: 12,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 48,
  },
});

export default BrainDumpScreen;

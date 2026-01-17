import React, { useState } from "react";
import { View, StyleSheet, TextInput, FlatList, TouchableOpacity } from "react-native";
import Screen from "../components/ui/Screen";
import ScreenHeader from "../components/ui/ScreenHeader";
import Card from "../components/ui/Card";
import AppText from "../components/ui/AppText";
import Button from "../components/ui/Button";
import { colors, spacing, radius } from "../theme";

interface DumpItem {
  id: string;
  text: string;
  createdAt: Date;
}

const BrainDumpScreen = () => {
  const [input, setInput] = useState("");
  const [items, setItems] = useState<DumpItem[]>([]);

  const addItem = () => {
    if (input.trim()) {
      const newItem: DumpItem = {
        id: Date.now().toString(),
        text: input.trim(),
        createdAt: new Date(),
      };
      setItems([newItem, ...items]);
      setInput("");
    }
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    setItems([]);
  };

  const renderItem = ({ item }: { item: DumpItem }) => (
    <Card style={styles.itemCard}>
      <AppText style={styles.itemText}>{item.text}</AppText>
      <TouchableOpacity
        onPress={() => deleteItem(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <AppText style={styles.deleteIcon}>✕</AppText>
      </TouchableOpacity>
    </Card>
  );

  return (
    <Screen>
      <ScreenHeader title="Brain Dump" subtitle="Clear your mind, capture everything" />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          placeholderTextColor={colors.textFaint}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={addItem}
          multiline
        />
        <Button
          label="Dump"
          size="md"
          onPress={addItem}
          style={styles.addButton}
        />
      </View>

      <View style={styles.listHeader}>
        <AppText variant="sectionTitle">Capture List</AppText>
        {items.length > 0 && (
          <TouchableOpacity onPress={clearAll}>
            <AppText style={styles.clearText}>Clear All</AppText>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AppText variant="smallMuted" style={styles.emptyText}>
              Your brain is empty... for now
            </AppText>
          </View>
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    marginBottom: spacing[24],
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    padding: spacing[16],
    color: colors.text,
    fontSize: 16,
    marginRight: spacing[12],
    minHeight: 56,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButton: {
    height: 56,
    paddingHorizontal: spacing[24],
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[16],
  },
  clearText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: spacing[32],
  },
  itemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing[12],
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemText: {
    flex: 1,
    marginRight: spacing[12],
  },
  deleteIcon: {
    color: colors.danger,
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyContainer: {
    marginTop: spacing[48],
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
  },
});

export default BrainDumpScreen;

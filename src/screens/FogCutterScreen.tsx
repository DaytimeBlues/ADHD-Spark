import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import Screen from "../components/ui/Screen";
import ScreenHeader from "../components/ui/ScreenHeader";
import Card from "../components/ui/Card";
import AppText from "../components/ui/AppText";
import Button from "../components/ui/Button";
import { colors, spacing, radius } from "../theme";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  microSteps: string[];
}

const FogCutterScreen = () => {
  const [task, setTask] = useState("");
  const [microSteps, setMicroSteps] = useState<string[]>([]);
  const [newStep, setNewStep] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);

  const addMicroStep = () => {
    if (newStep.trim()) {
      setMicroSteps([...microSteps, newStep.trim()]);
      setNewStep("");
    }
  };

  const addTask = () => {
    if (task.trim() && microSteps.length > 0) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: task,
        completed: false,
        microSteps: [...microSteps],
      };
      setTasks([...tasks, newTask]);
      setTask("");
      setMicroSteps([]);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const renderMicroStep = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => (
    <View style={styles.microStep}>
      <AppText variant="smallMuted" style={styles.stepNumber}>
        {index + 1}
      </AppText>
      <AppText style={styles.stepText}>{item}</AppText>
    </View>
  );

  return (
    <Screen>
      <ScreenHeader
        title="Fog Cutter"
        subtitle="Break big tasks into tiny steps"
      />

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="What feels overwhelming?"
          placeholderTextColor={colors.textFaint}
          value={task}
          onChangeText={setTask}
        />

        <View style={styles.addStepRow}>
          <TextInput
            style={styles.stepInput}
            placeholder="Add a micro-step..."
            placeholderTextColor={colors.textFaint}
            value={newStep}
            onChangeText={setNewStep}
            onSubmitEditing={addMicroStep}
          />
          <Button
            label="+"
            size="md"
            onPress={addMicroStep}
            style={styles.addButton}
          />
        </View>

        {microSteps.length > 0 && (
          <Card style={styles.previewContainer}>
            <AppText variant="smallMuted" style={styles.previewTitle}>
              Steps for "{task || "this task"}":
            </AppText>
            <FlatList
              data={microSteps}
              renderItem={renderMicroStep}
              keyExtractor={(_, index) => index.toString()}
              scrollEnabled={false}
            />
          </Card>
        )}

        <Button
          label="Save Task"
          disabled={microSteps.length === 0 || !task.trim()}
          onPress={addTask}
          style={styles.saveButton}
        />
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => toggleTask(item.id)}
          >
            <Card
              style={[
                styles.taskCard,
                item.completed && styles.taskCardCompleted,
              ]}
            >
              <AppText
                variant="sectionTitle"
                style={[styles.taskText, item.completed && styles.completed]}
              >
                {item.text}
              </AppText>
              <View style={styles.stepCount}>
                <AppText variant="smallMuted" style={styles.stepCountText}>
                  {item.microSteps.length} micro-steps
                </AppText>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        style={styles.taskList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          tasks.length > 0 ? (
            <AppText variant="sectionTitle" style={styles.listHeader}>
              Active Tasks
            </AppText>
          ) : null
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  inputArea: {
    marginBottom: spacing[24],
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    padding: spacing[16],
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing[12],
    borderWidth: 1,
    borderColor: colors.border,
  },
  addStepRow: {
    flexDirection: "row",
    marginBottom: spacing[16],
  },
  stepInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    padding: spacing[16],
    color: colors.text,
    fontSize: 14,
    marginRight: spacing[12],
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButton: {
    width: 56,
    height: 56,
  },
  previewContainer: {
    padding: spacing[16],
    marginBottom: spacing[16],
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
  },
  previewTitle: {
    marginBottom: spacing[12],
  },
  microStep: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing[8],
  },
  stepNumber: {
    backgroundColor: colors.accent,
    color: colors.text,
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: "center",
    lineHeight: 24,
    fontSize: 12,
    fontWeight: "bold",
    marginRight: spacing[12],
    overflow: "hidden",
  },
  stepText: {
    flex: 1,
  },
  saveButton: {
    marginBottom: spacing[16],
  },
  taskList: {
    flex: 1,
  },
  listHeader: {
    marginBottom: spacing[16],
    marginTop: spacing[8],
  },
  taskCard: {
    marginBottom: spacing[12],
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskCardCompleted: {
    opacity: 0.5,
  },
  taskText: {
    marginBottom: spacing[8],
  },
  completed: {
    textDecorationLine: "line-through",
    color: colors.textMuted,
  },
  stepCount: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[4],
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  stepCountText: {
    fontSize: 12,
  },
});

export default FogCutterScreen;

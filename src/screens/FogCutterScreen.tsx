import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Platform,
} from 'react-native';
import StorageService from '../services/StorageService';
import { generateId } from '../utils/helpers';
import { LinearButton } from '../components/ui/LinearButton';
import { Tokens } from '../theme/tokens';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  microSteps: string[];
}

const FogCutterScreen = () => {
  const [task, setTask] = useState('');
  const [microSteps, setMicroSteps] = useState<string[]>([]);
  const [newStep, setNewStep] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const loadTasks = async () => {
      const storedTasks = await StorageService.getJSON<Task[]>(
        StorageService.STORAGE_KEYS.tasks,
      );
      if (!storedTasks || !Array.isArray(storedTasks)) {
        return;
      }

      const normalized = storedTasks.filter(item => {
        return Boolean(item?.id && item?.text && Array.isArray(item?.microSteps));
      });
      setTasks(normalized);
    };

    loadTasks();
  }, []);

  useEffect(() => {
    StorageService.setJSON(StorageService.STORAGE_KEYS.tasks, tasks);
  }, [tasks]);

  const addMicroStep = () => {
    if (newStep.trim()) {
      setMicroSteps([...microSteps, newStep.trim()]);
      setNewStep('');
    }
  };

  const addTask = () => {
    if (task.trim() && microSteps.length > 0) {
      const newTask: Task = {
        id: generateId(),
        text: task,
        completed: false,
        microSteps: [...microSteps],
      };
      setTasks(prevTasks => [...prevTasks, newTask]);
      setTask('');
      setMicroSteps([]);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  const renderMicroStep = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.microStep}>
      <Text style={styles.stepNumber}>{index + 1}</Text>
      <Text style={styles.stepText}>{item}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Fog Cutter</Text>
          <Text style={styles.subtitle}>Break big tasks into tiny steps</Text>

          <TextInput
            style={styles.input}
            placeholder="What feels overwhelming?"
            placeholderTextColor={Tokens.colors.text.tertiary}
            value={task}
            onChangeText={setTask}
          />

          <View style={styles.addStepRow}>
            <TextInput
              style={styles.stepInput}
              placeholder="Add a micro-step..."
              placeholderTextColor={Tokens.colors.text.tertiary}
              value={newStep}
              onChangeText={setNewStep}
              onSubmitEditing={addMicroStep}
            />
            <LinearButton
              title="+"
              onPress={addMicroStep}
              variant="secondary"
              style={styles.addButton}
            />
          </View>

          {microSteps.length > 0 && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>
                Micro-steps for "{task}":
              </Text>
              <FlatList
                data={microSteps}
                renderItem={renderMicroStep}
                keyExtractor={(_, index) => index.toString()}
                scrollEnabled={false}
              />
            </View>
          )}

          <LinearButton
            title="Save Task"
            onPress={addTask}
            disabled={microSteps.length === 0}
            size="lg"
            style={styles.saveButton}
          />

          <FlatList
            data={tasks}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.taskCard,
                  item.completed && styles.taskCardCompleted,
                ]}
                onPress={() => toggleTask(item.id)}>
                <Text style={[styles.taskText, item.completed && styles.completed]}>
                  {item.text}
                </Text>
                <View style={styles.stepCount}>
                  <Text style={styles.stepCountText}>
                    {item.microSteps.length} steps
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            style={styles.taskList}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral.darkest,
  },
  scrollContent: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 680,
    padding: Tokens.spacing[4],
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: '700',
    color: Tokens.colors.text.primary,
    marginBottom: Tokens.spacing[1],
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.base,
    color: Tokens.colors.text.secondary,
    marginBottom: Tokens.spacing[6],
  },
  input: {
    backgroundColor: Tokens.colors.neutral.darker,
    borderRadius: Tokens.radii.md,
    paddingHorizontal: Tokens.spacing[4],
    color: Tokens.colors.text.primary,
    fontFamily: 'Inter',
    fontSize: Tokens.type.base,
    marginBottom: Tokens.spacing[4],
    height: 44,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
  },
  addStepRow: {
    flexDirection: 'row',
    marginBottom: Tokens.spacing[6],
    gap: Tokens.spacing[2],
  },
  stepInput: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral.darker,
    borderRadius: Tokens.radii.md,
    paddingHorizontal: Tokens.spacing[4],
    color: Tokens.colors.text.primary,
    fontFamily: 'Inter',
    fontSize: Tokens.type.sm,
    height: 44,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
  },
  addButton: {
    width: 44,
    height: 44,
  },
  previewContainer: {
    backgroundColor: Tokens.colors.neutral.darker,
    borderRadius: Tokens.radii.lg,
    padding: Tokens.spacing[4],
    marginBottom: Tokens.spacing[4],
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
  },
  previewTitle: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.secondary,
    fontSize: Tokens.type.xs,
    marginBottom: Tokens.spacing[3],
  },
  microStep: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Tokens.spacing[2],
  },
  stepNumber: {
    backgroundColor: Tokens.colors.indigo.subtle,
    color: Tokens.colors.indigo.primary,
    width: 22,
    height: 22,
    borderRadius: Tokens.radii.md,
    textAlign: 'center',
    lineHeight: 22,
    fontSize: Tokens.type.xxs,
    fontWeight: 'bold',
    marginRight: Tokens.spacing[3],
  },
  stepText: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.primary,
    fontSize: Tokens.type.sm,
  },
  saveButton: {
    marginBottom: Tokens.spacing[6],
  },
  taskList: {
    flex: 1,
  },
  taskCard: {
    backgroundColor: Tokens.colors.neutral.darker,
    borderRadius: Tokens.radii.lg,
    padding: Tokens.spacing[4],
    marginBottom: Tokens.spacing[3],
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    minHeight: 60,
  },
  taskCardCompleted: {
    opacity: 0.4,
  },
  taskText: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.primary,
    fontSize: Tokens.type.base,
    fontWeight: '600',
    marginBottom: Tokens.spacing[2],
  },
  completed: {
    textDecorationLine: 'line-through',
  },
  stepCount: {
    backgroundColor: Tokens.colors.neutral.darkest,
    paddingHorizontal: Tokens.spacing[2],
    paddingVertical: Tokens.spacing[1],
    borderRadius: Tokens.radii.md,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
  },
  stepCountText: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.tertiary,
    fontSize: Tokens.type.xxs,
  },
});

export default FogCutterScreen;


import React, {useEffect, useState} from 'react';
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
import {generateId} from '../utils/helpers';
import {Tokens} from '../theme/tokens';

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
      prevTasks.map(t => (t.id === id ? {...t, completed: !t.completed} : t)),
    );
  };

  const renderMicroStep = ({item, index}: {item: string; index: number}) => (
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
            placeholderTextColor={Tokens.colors.neutral[300]}
            value={task}
            onChangeText={setTask}
          />

          <View style={styles.addStepRow}>
            <TextInput
              style={styles.stepInput}
              placeholder="Add a micro-step..."
              placeholderTextColor={Tokens.colors.neutral[300]}
              value={newStep}
              onChangeText={setNewStep}
              onSubmitEditing={addMicroStep}
            />
            <TouchableOpacity style={styles.addButton} onPress={addMicroStep}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
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

          <TouchableOpacity
            style={[styles.saveButton, microSteps.length === 0 && styles.disabled]}
            onPress={addTask}
            disabled={microSteps.length === 0}>
            <Text style={styles.saveButtonText}>Save Task</Text>
          </TouchableOpacity>

          <FlatList
            data={tasks}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
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
    backgroundColor: Tokens.colors.neutral[900],
  },
  scrollContent: {
    flex: 1,
    alignItems: 'center', // Centers the content for web
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: Tokens.layout.maxWidth.prose,
    padding: Tokens.spacing[16],
  },
  title: {
    fontSize: Tokens.type['3xl'],
    fontWeight: 'bold',
    color: Tokens.colors.neutral[0],
    marginBottom: Tokens.spacing[4],
  },
  subtitle: {
    fontSize: Tokens.type.base,
    color: Tokens.colors.neutral[300],
    marginBottom: Tokens.spacing[24],
  },
  input: {
    backgroundColor: Tokens.colors.neutral[800],
    borderRadius: Tokens.radii.md,
    padding: Tokens.spacing[16],
    color: Tokens.colors.neutral[0],
    fontSize: Tokens.type.base,
    marginBottom: Tokens.spacing[16],
    height: Tokens.layout.minTapTargetComfortable,
  },
  addStepRow: {
    flexDirection: 'row',
    marginBottom: Tokens.spacing[24],
  },
  stepInput: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral[800],
    borderRadius: Tokens.radii.md,
    padding: Tokens.spacing[16],
    color: Tokens.colors.neutral[0],
    fontSize: Tokens.type.sm,
    marginRight: Tokens.spacing[12],
    height: Tokens.layout.minTapTargetComfortable,
  },
  addButton: {
    backgroundColor: Tokens.colors.brand[600],
    width: Tokens.layout.minTapTargetComfortable,
    height: Tokens.layout.minTapTargetComfortable,
    borderRadius: Tokens.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: Tokens.colors.neutral[0],
    fontSize: Tokens.type['2xl'],
    fontWeight: 'bold',
  },
  previewContainer: {
    backgroundColor: Tokens.colors.neutral[800],
    borderRadius: Tokens.radii.md,
    padding: Tokens.spacing[16],
    marginBottom: Tokens.spacing[16],
    ...Tokens.elevation.sm,
  },
  previewTitle: {
    color: Tokens.colors.neutral[300],
    fontSize: Tokens.type.sm,
    marginBottom: Tokens.spacing[12],
  },
  microStep: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Tokens.spacing[8],
  },
  stepNumber: {
    backgroundColor: Tokens.colors.brand[600],
    color: Tokens.colors.neutral[0],
    width: 24,
    height: 24,
    borderRadius: Tokens.radii.md,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: Tokens.type.xs,
    fontWeight: 'bold',
    marginRight: Tokens.spacing[12],
  },
  stepText: {
    color: Tokens.colors.neutral[0],
    fontSize: Tokens.type.sm,
  },
  saveButton: {
    backgroundColor: Tokens.colors.brand[600],
    paddingVertical: Tokens.spacing[16], // Increased to ensure height > 44
    borderRadius: Tokens.radii.md,
    alignItems: 'center',
    marginBottom: Tokens.spacing[24],
    minHeight: Tokens.layout.minTapTargetComfortable,
    justifyContent: 'center',
    ...Tokens.elevation.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: Tokens.colors.neutral[0],
    fontSize: Tokens.type.base,
    fontWeight: '600',
  },
  taskList: {
    flex: 1,
  },
  taskCard: {
    backgroundColor: Tokens.colors.neutral[800],
    borderRadius: Tokens.radii.md,
    padding: Tokens.spacing[16],
    marginBottom: Tokens.spacing[12],
    ...Tokens.elevation.sm,
    minHeight: 60, // Ensure decent click area
  },
  taskCardCompleted: {
    opacity: 0.5,
  },
  taskText: {
    color: Tokens.colors.neutral[0],
    fontSize: Tokens.type.base,
    fontWeight: '600',
    marginBottom: Tokens.spacing[8],
  },
  completed: {
    textDecorationLine: 'line-through',
  },
  stepCount: {
    backgroundColor: Tokens.colors.neutral[900],
    paddingHorizontal: Tokens.spacing[12],
    paddingVertical: Tokens.spacing[4],
    borderRadius: Tokens.radii.md,
    alignSelf: 'flex-start',
  },
  stepCountText: {
    color: Tokens.colors.neutral[300],
    fontSize: Tokens.type.xs,
  },
});

export default FogCutterScreen;


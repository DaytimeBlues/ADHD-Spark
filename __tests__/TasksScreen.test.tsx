import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import TasksScreen from '../src/screens/TasksScreen';

const mockNavigation = { goBack: jest.fn() };
const mockAddTask = jest.fn();
const mockToggleTask = jest.fn();
const mockDeleteTask = jest.fn();

const mockTasks = [
  {
    id: 'task-1',
    title: 'Active Task',
    priority: 'urgent' as const,
    completed: false,
    source: 'manual' as const,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'task-2',
    title: 'Completed Task',
    priority: 'normal' as const,
    completed: true,
    source: 'manual' as const,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

const mockState = {
  tasks: mockTasks,
  addTask: (...args: unknown[]) => mockAddTask(...args),
  toggleTask: (...args: unknown[]) => mockToggleTask(...args),
  deleteTask: (...args: unknown[]) => mockDeleteTask(...args),
};

jest.mock('@react-navigation/native', () => ({
  __esModule: true,
  useNavigation: () => mockNavigation,
}));

jest.mock('react-native-safe-area-context', () => ({
  __esModule: true,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../src/store/useTaskStore', () => ({
  __esModule: true,
  useTaskStore: (selector: (state: typeof mockState) => unknown) =>
    selector(mockState),
}));

jest.mock('../src/ui/cosmic', () => {
  const React = require('react');
  const { View, TouchableOpacity, Text } = require('react-native');

  return {
    __esModule: true,
    CosmicBackground: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
    GlowCard: ({
      children,
      onPress,
    }: {
      children: React.ReactNode;
      onPress?: () => void;
    }) => (
      <TouchableOpacity onPress={onPress} disabled={!onPress}>
        <View>{children}</View>
      </TouchableOpacity>
    ),
    RuneButton: ({
      children,
      onPress,
      disabled,
    }: {
      children: React.ReactNode;
      onPress?: () => void;
      disabled?: boolean;
    }) => (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
      >
        <Text>{children}</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');
  const AnimatedView = React.forwardRef(
    (
      props: React.ComponentProps<typeof View> & { children: React.ReactNode },
      ref: React.Ref<any>,
    ) => <View ref={ref} {...props} />,
  );

  return {
    __esModule: true,
    default: {
      View: AnimatedView,
    },
    FadeIn: {
      delay: () => ({
        duration: () => ({}),
      }),
    },
    SlideInRight: {
      delay: () => ({
        duration: () => ({}),
      }),
    },
    Layout: {
      springify: () => ({}),
    },
    useSharedValue: (value: number) => ({ value }),
    useAnimatedStyle: (updater: () => object) => updater(),
    withSpring: (value: number) => value,
    withSequence: (...values: number[]) => values[values.length - 1],
  };
});

describe('TasksScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds a task from input', () => {
    render(<TasksScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText('New objective...'),
      '  Plan roadmap  ',
    );
    fireEvent.press(screen.getByText('+'));

    expect(mockAddTask).toHaveBeenCalledWith({
      title: 'Plan roadmap',
      priority: 'normal',
      source: 'manual',
    });
  });

  it('deletes task rows', () => {
    render(<TasksScreen />);

    fireEvent.press(screen.getAllByText('✕')[0]);
    expect(mockDeleteTask).toHaveBeenCalledWith('task-1');
  });

  it('navigates back from header action', () => {
    render(<TasksScreen />);

    fireEvent.press(screen.getByText('←'));
    expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
  });
});

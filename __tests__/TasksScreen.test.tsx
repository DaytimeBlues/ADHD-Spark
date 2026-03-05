import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import TasksScreen from '../src/screens/TasksScreen';

const mockNavigation = { goBack: jest.fn() };
const mockAddTask = jest.fn();
const mockToggleTask = jest.fn();
const mockDeleteTask = jest.fn();

const createTasks = () => [
  {
    id: 'task-1',
    title: 'Active Task',
    priority: 'urgent' as const,
    completed: false,
    dueDate: 'Tomorrow',
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

let currentTasks = createTasks();

const mockState = {
  get tasks() {
    return currentTasks;
  },
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
  const ReactLocal = require('react');
  const { View } = require('react-native');
  const AnimatedView = ReactLocal.forwardRef(
    (
      props: React.ComponentProps<typeof View> & { children: React.ReactNode },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    jest.useRealTimers();
    currentTasks = createTasks();
  });

  it('adds a task from trimmed input', () => {
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

  it('does not add a task for blank input', () => {
    render(<TasksScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText('New objective...'),
      '   ',
    );
    fireEvent.press(screen.getByText('+'));

    expect(mockAddTask).not.toHaveBeenCalled();
  });

  it('toggles completion and deletes tasks', () => {
    render(<TasksScreen />);

    fireEvent.press(screen.getByLabelText('Mark as complete'));
    expect(mockToggleTask).toHaveBeenCalledWith('task-1');

    fireEvent.press(screen.getAllByLabelText('Delete task')[0]);
    expect(mockDeleteTask).toHaveBeenCalledWith('task-1');
  });

  it('navigates back from the header action', () => {
    render(<TasksScreen />);

    fireEvent.press(screen.getByLabelText('Go back'));
    expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
  });

  it('filters active/done tasks and shows empty state', () => {
    currentTasks = [
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

    render(<TasksScreen />);

    fireEvent.press(screen.getAllByText('ACTIVE').slice(-1)[0]);
    expect(screen.getByText('Celestial Clear')).toBeTruthy();

    fireEvent.press(screen.getAllByText('DONE').slice(-1)[0]);
    expect(screen.getByText('Completed Task')).toBeTruthy();
  });

  it('shows due date details when present', () => {
    render(<TasksScreen />);
    expect(screen.getByText(/Tomorrow/)).toBeTruthy();
  });

  it('shows syncing state and resets after timer', () => {
    jest.useFakeTimers();
    render(<TasksScreen />);

    fireEvent.press(screen.getByText('SYNC'));
    expect(screen.getByText('SYNCING')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(screen.getByText('SYNC')).toBeTruthy();
  });
});

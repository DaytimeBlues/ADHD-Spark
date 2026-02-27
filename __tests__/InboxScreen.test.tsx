import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import InboxScreen from '../src/screens/InboxScreen';

const mockPromote = jest.fn().mockResolvedValue(undefined);
const mockDiscard = jest.fn().mockResolvedValue(undefined);

jest.mock('@react-navigation/native', () => ({
  __esModule: true,
  useNavigation: () => ({ goBack: jest.fn() }),
}));

jest.mock('../src/services/CaptureService', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn().mockResolvedValue([
      {
        id: 'capture-1',
        source: 'text',
        status: 'unreviewed',
        raw: 'sample capture',
        createdAt: Date.now(),
      },
    ]),
    promote: (...args: unknown[]) => mockPromote(...args),
    discard: (...args: unknown[]) => mockDiscard(...args),
    subscribe: (cb: () => void) => {
      cb();
      return () => undefined;
    },
  },
}));

jest.mock('../src/services/LoggerService', () => ({
  __esModule: true,
  LoggerService: { error: jest.fn() },
}));

jest.mock('../src/ui/cosmic', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    CosmicBackground: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
  };
});

describe('InboxScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders list and handles promote/discard actions', async () => {
    render(<InboxScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('capture-row-capture-1')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('promote-task-capture-1'));
    expect(mockPromote).toHaveBeenCalledWith('capture-1', 'task');

    fireEvent.press(screen.getByTestId('discard-capture-1'));
    expect(mockDiscard).toHaveBeenCalledWith('capture-1');
  });
});

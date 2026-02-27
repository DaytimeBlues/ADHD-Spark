import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import ChatScreen from '../src/screens/ChatScreen';

const mockSendMessage = jest.fn().mockResolvedValue(undefined);
const mockSubscribe = jest.fn((handler: (msgs: unknown[]) => void) => {
  handler([]);
  return () => undefined;
});

jest.mock('../src/services/ChatService', () => ({
  __esModule: true,
  default: {
    sendMessage: (...args: unknown[]) => mockSendMessage(...args),
    subscribe: (...args: unknown[]) => mockSubscribe(...args),
  },
}));

jest.mock('../src/ui/cosmic', () => {
  const React = require('react');
  const { Text, View, Pressable } = require('react-native');
  return {
    CosmicBackground: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
    GlowCard: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
    RuneButton: ({
      children,
      onPress,
    }: {
      children: React.ReactNode;
      onPress?: () => void;
    }) => (
      <Pressable onPress={onPress}>
        <Text>{children}</Text>
      </Pressable>
    ),
  };
});

describe('ChatScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders chat UI and sends message', () => {
    render(<ChatScreen />);

    expect(screen.getByText('SPARK_ASSISTANT')).toBeTruthy();
    expect(screen.getByText('HOW CAN I HELP YOU FOCUS TODAY?')).toBeTruthy();

    fireEvent.changeText(
      screen.getByPlaceholderText('TYPE_YOUR_THOUGHTS...'),
      'Hello',
    );
    fireEvent.press(screen.getByText('SEND'));

    expect(mockSendMessage).toHaveBeenCalledWith('Hello');
  });
});

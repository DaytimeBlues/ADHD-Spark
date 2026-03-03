import React from 'react';
import { render, screen } from '@testing-library/react-native';
import AnchorScreen from '../src/screens/AnchorScreen';

jest.mock('../src/hooks/useTimer', () => ({
  __esModule: true,
  default: () => ({
    timeLeft: 4,
    start: jest.fn(),
    reset: jest.fn(),
    setTime: jest.fn(),
  }),
}));

jest.mock('../src/ui/cosmic', () => {
  const React = require('react');
  const { Text, View, Pressable } = require('react-native');

  return {
    CosmicBackground: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
    GlowCard: ({
      children,
      onPress,
    }: {
      children: React.ReactNode;
      onPress?: () => void;
    }) => <Pressable onPress={onPress}>{children}</Pressable>,
    HaloRing: () => <View />,
    ChronoDigits: ({ value }: { value: string }) => <Text>{value}</Text>,
    RuneButton: ({
      children,
      onPress,
    }: {
      children: React.ReactNode;
      onPress?: () => void;
    }) => <Pressable onPress={onPress}>{children}</Pressable>,
  };
});

describe('AnchorScreen', () => {
  it('renders anchor title and breathing pattern options', () => {
    render(<AnchorScreen />);

    expect(screen.getByText('ANCHOR')).toBeTruthy();
    expect(screen.getByText('4-7-8 RELAX')).toBeTruthy();
    expect(screen.getByText('BOX BREATHING')).toBeTruthy();
    expect(screen.getByText('ENERGIZE')).toBeTruthy();
  });
});

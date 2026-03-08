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
  const { Text, View, Pressable } = require('react-native');

  return {
    CosmicBackground: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
    GlowCard: ({
      children,
      onPress,
      accessibilityLabel,
      accessibilityHint,
      accessibilityRole,
    }: {
      children: React.ReactNode;
      onPress?: () => void;
      accessibilityLabel?: string;
      accessibilityHint?: string;
      accessibilityRole?: string;
    }) => (
      <Pressable
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
      >
        {children}
      </Pressable>
    ),
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

describe('AnchorScreen Accessibility', () => {
  it('provides accessibility labels for breathing pattern buttons', () => {
    render(<AnchorScreen />);

    // Check that each pattern button has an accessibility label
    expect(screen.getByLabelText('4-7-8 RELAX breathing pattern')).toBeTruthy();
    expect(
      screen.getByLabelText('BOX BREATHING breathing pattern'),
    ).toBeTruthy();
    expect(screen.getByLabelText('ENERGIZE breathing pattern')).toBeTruthy();
  });

  it('provides accessibility hints for breathing pattern buttons', () => {
    render(<AnchorScreen />);

    // Check that each pattern button has an accessibility hint
    const relaxButton = screen.getByLabelText('4-7-8 RELAX breathing pattern');
    const boxButton = screen.getByLabelText('BOX BREATHING breathing pattern');
    const energizeButton = screen.getByLabelText('ENERGIZE breathing pattern');

    expect(relaxButton.props.accessibilityHint).toBe(
      'Double tap to select 4-7-8 RELAX breathing exercise',
    );
    expect(boxButton.props.accessibilityHint).toBe(
      'Double tap to select BOX BREATHING breathing exercise',
    );
    expect(energizeButton.props.accessibilityHint).toBe(
      'Double tap to select ENERGIZE breathing exercise',
    );
  });

  it('marks emoji as hidden from accessibility', () => {
    render(<AnchorScreen />);

    // Find all Text elements with emoji
    const allTexts = screen.queryAllByText(/[🌙📦⚡]/);

    // Each emoji text should be hidden from accessibility
    allTexts.forEach((textElement) => {
      expect(textElement.props.accessibilityElementsHidden).toBe(true);
      expect(textElement.props.importantForAccessibility).toBe('no');
    });
  });
});

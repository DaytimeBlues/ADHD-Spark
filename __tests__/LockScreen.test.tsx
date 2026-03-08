import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { LockScreen } from '../src/components/LockScreen';

jest.mock('../src/theme/useTheme', () => ({
  useTheme: jest.fn(),
}));

jest.mock('../src/ui/cosmic/CosmicBackground', () => ({
  CosmicBackground: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../src/ui/cosmic/GlowCard', () => ({
  GlowCard: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../src/components/ui/LinearButton', () => ({
  LinearButton: ({
    title,
    onPress,
  }: {
    title: string;
    onPress: () => void;
  }) => {
    const ReactNative = require('react-native');
    return (
      <ReactNative.Pressable onPress={onPress} accessibilityRole="button">
        <ReactNative.Text>{title}</ReactNative.Text>
      </ReactNative.Pressable>
    );
  },
}));

const mockUseTheme = jest.requireMock('../src/theme/useTheme')
  .useTheme as jest.Mock;

describe('LockScreen', () => {
  beforeEach(() => {
    mockUseTheme.mockReturnValue({ isCosmic: false });
  });

  it('renders the lock state and triggers unlock when authenticate is pressed', () => {
    const onUnlock = jest.fn();

    render(<LockScreen onUnlock={onUnlock} />);

    expect(screen.getByText('LOCKED')).toBeTruthy();
    expect(
      screen.getByText(
        'Spark is currently locked to protect your focus and data.',
      ),
    ).toBeTruthy();

    fireEvent.press(screen.getByText('AUTHENTICATE'));

    expect(onUnlock).toHaveBeenCalledTimes(1);
  });

  it('renders the cosmic background when the cosmic theme is active', () => {
    mockUseTheme.mockReturnValue({ isCosmic: true });
    const onUnlock = jest.fn();

    render(<LockScreen onUnlock={onUnlock} />);

    expect(screen.getByText('LOCKED')).toBeTruthy();
    expect(screen.getByText('AUTHENTICATE')).toBeTruthy();
  });
});

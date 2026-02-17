import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Platform } from 'react-native';
import CalendarScreen from '../src/screens/CalendarScreen';

const mockSignInInteractive = jest.fn().mockResolvedValue(true);

jest.mock('../src/services/PlaudService', () => ({
  __esModule: true,
  GoogleTasksSyncService: {
    signInInteractive: (...args: unknown[]) => mockSignInInteractive(...args),
  },
}));

describe('CalendarScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows unsupported status on web and disables connect button', async () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => 'web',
    });

    render(<CalendarScreen />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText('STATUS: NOT AVAILABLE ON WEB')).toBeTruthy();
    const button = screen.getByText('WEB UNSUPPORTED');
    fireEvent.press(button);
    expect(mockSignInInteractive).not.toHaveBeenCalled();
  });
});

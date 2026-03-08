import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import CalendarScreen from '../src/screens/CalendarScreen';

// Control `isWeb` per test — the screen imports it as a module-scope constant.
let mockIsWeb = false;
jest.mock('../src/utils/PlatformUtils', () => ({
  get isWeb() {
    return mockIsWeb;
  },
  get isAndroid() {
    return !mockIsWeb;
  },
  get isIOS() {
    return false;
  },
}));

const mockSignInInteractive = jest.fn().mockResolvedValue(true);
const mockGetCurrentUserScopes = jest.fn().mockResolvedValue(null);

jest.mock('../src/services/GoogleTasksSyncService', () => ({
  __esModule: true,
  GoogleTasksSyncService: {
    signInInteractive: (...args: unknown[]) => mockSignInInteractive(...args),
    getCurrentUserScopes: (...args: unknown[]) =>
      mockGetCurrentUserScopes(...args),
  },
}));

describe('CalendarScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsWeb = false;
  });

  it('shows unsupported status on web and disables connect button', async () => {
    mockIsWeb = true;

    render(<CalendarScreen />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText('STATUS: NOT AVAILABLE ON WEB')).toBeTruthy();
    const button = screen.getByText('WEB UNSUPPORTED');
    fireEvent.press(button);
    expect(mockSignInInteractive).not.toHaveBeenCalled();
  });

  it('shows disconnected status on native when calendar scope is missing', async () => {
    mockIsWeb = false;
    mockGetCurrentUserScopes.mockResolvedValueOnce(null);

    render(<CalendarScreen />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText('STATUS: NOT CONNECTED')).toBeTruthy();
    expect(screen.getByText('CONNECT GOOGLE CALENDAR')).toBeTruthy();
  });

  it('shows connected status when calendar scope is present and prevents reconnect', async () => {
    mockIsWeb = false;
    mockGetCurrentUserScopes.mockResolvedValueOnce([
      'https://www.googleapis.com/auth/calendar.events',
    ]);

    render(<CalendarScreen />);

    await act(async () => {
      await Promise.resolve();
    });

    const button = screen.getByText('CONNECTED');
    fireEvent.press(button);

    expect(screen.getByText('STATUS: CONNECTED')).toBeTruthy();
    expect(mockSignInInteractive).not.toHaveBeenCalled();
  });

  it('attempts connect on native when disconnected', async () => {
    mockIsWeb = false;
    mockGetCurrentUserScopes
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce([
        'https://www.googleapis.com/auth/calendar.events',
      ]);

    render(<CalendarScreen />);

    await act(async () => {
      await Promise.resolve();
    });

    fireEvent.press(screen.getByText('CONNECT GOOGLE CALENDAR'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockSignInInteractive).toHaveBeenCalledTimes(1);
  });
});

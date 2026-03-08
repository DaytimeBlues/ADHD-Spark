import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { CaptureBubble } from '../src/components/capture/CaptureBubble';

const mockNavigate = jest.fn();
const mockUpdateCount = jest.fn();

let checkInSubscriber: ((isPending: boolean) => void) | null = null;

jest.mock('../src/services/CaptureService', () => ({
  __esModule: true,
  default: {
    subscribe: jest.fn((callback: (count: number) => void) => {
      callback(0);
      return jest.fn();
    }),
  },
}));

jest.mock('../src/services/CheckInService', () => ({
  __esModule: true,
  CheckInService: {
    subscribe: jest.fn((callback: (isPending: boolean) => void) => {
      checkInSubscriber = callback;
      callback(false);
      return jest.fn();
    }),
    setPending: jest.fn(),
  },
}));

jest.mock('../src/navigation/navigationRef', () => ({
  __esModule: true,
  navigationRef: {
    isReady: jest.fn(() => true),
    navigate: (...args: unknown[]) => mockNavigate(...args),
  },
}));

jest.mock('../src/store/useTaskStore', () => ({
  __esModule: true,
  useTaskStore: (
    selector: (state: { getActiveCount: () => number }) => number,
  ) => selector({ getActiveCount: () => 0 }),
}));

jest.mock('../src/services/OverlayService', () => ({
  __esModule: true,
  default: {
    updateCount: (...args: unknown[]) => mockUpdateCount(...args),
  },
}));

jest.mock('../src/components/capture/CaptureDrawer', () => ({
  __esModule: true,
  CaptureDrawer: ({ visible }: { visible: boolean }) => {
    const { Text } = require('react-native');
    return visible ? (
      <Text testID="capture-drawer-mock">DRAWER_OPEN</Text>
    ) : null;
  },
}));

describe('CaptureBubble', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    checkInSubscriber = null;
  });

  it('opens the drawer from the idle bubble state', () => {
    render(<CaptureBubble />);

    fireEvent.press(screen.getByTestId('capture-bubble'));

    expect(screen.getByTestId('capture-drawer-mock')).toBeTruthy();
  });

  it('opens in check-in mode when a check-in is pending', () => {
    render(<CaptureBubble />);

    act(() => {
      checkInSubscriber?.(true);
    });
    fireEvent.press(screen.getByTestId('capture-bubble'));

    expect(screen.getByTestId('capture-drawer-mock')).toBeTruthy();
  });
});

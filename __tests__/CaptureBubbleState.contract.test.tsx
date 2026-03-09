import React from 'react';
import { act, render, screen } from '@testing-library/react-native';
import { CaptureBubble } from '../src/components/capture/CaptureBubble';

let captureSubscriber: ((count: number) => void) | null = null;
let checkInSubscriber: ((isPending: boolean) => void) | null = null;
let mockCaptureCount = 0;
let mockCheckInPending = false;

jest.mock('../src/services/CaptureService', () => ({
  __esModule: true,
  default: {
    subscribe: jest.fn((callback: (count: number) => void) => {
      captureSubscriber = callback;
      callback(mockCaptureCount);
      return jest.fn();
    }),
  },
}));

jest.mock('../src/services/CheckInService', () => ({
  __esModule: true,
  CheckInService: {
    subscribe: jest.fn((callback: (isPending: boolean) => void) => {
      checkInSubscriber = callback;
      callback(mockCheckInPending);
      return jest.fn();
    }),
    setPending: jest.fn(),
  },
}));

jest.mock('../src/services/OverlayService', () => ({
  __esModule: true,
  default: {
    updateCount: jest.fn(),
  },
}));

jest.mock('../src/store/useTaskStore', () => ({
  __esModule: true,
  useTaskStore: (
    selector: (state: { getActiveCount: () => number }) => number,
  ) => selector({ getActiveCount: () => 0 }),
}));

jest.mock('../src/navigation/navigationRef', () => ({
  __esModule: true,
  navigationRef: {
    isReady: jest.fn(() => true),
    navigate: jest.fn(),
  },
}));

jest.mock('../src/components/capture/CaptureDrawer', () => ({
  __esModule: true,
  CaptureDrawer: () => null,
}));

jest.mock('../src/components/capture/CaptureBubbleFab', () => ({
  __esModule: true,
  CaptureBubbleFab: ({
    bubbleState,
    totalBadgeCount,
  }: {
    bubbleState: string;
    totalBadgeCount: number;
  }) => {
    const React = require('react');
    const { Text, View } = require('react-native');
    return (
      <View>
        <Text testID="bubble-state">{bubbleState}</Text>
        <Text testID="bubble-badge-count">{String(totalBadgeCount)}</Text>
      </View>
    );
  },
}));

describe('Capture bubble state contract', () => {
  beforeEach(() => {
    captureSubscriber = null;
    checkInSubscriber = null;
    mockCaptureCount = 0;
    mockCheckInPending = false;
  });

  it('transitions between idle, needs-review, and needs-checkin in the expected order', () => {
    render(<CaptureBubble />);

    expect(screen.getByTestId('bubble-state')).toHaveTextContent('idle');
    expect(screen.getByTestId('bubble-badge-count')).toHaveTextContent('0');

    act(() => {
      mockCaptureCount = 2;
      captureSubscriber?.(2);
    });
    expect(screen.getByTestId('bubble-state')).toHaveTextContent(
      'needs-review',
    );
    expect(screen.getByTestId('bubble-badge-count')).toHaveTextContent('2');

    act(() => {
      mockCheckInPending = true;
      checkInSubscriber?.(true);
    });
    expect(screen.getByTestId('bubble-state')).toHaveTextContent(
      'needs-checkin',
    );

    act(() => {
      mockCheckInPending = false;
      checkInSubscriber?.(false);
    });
    expect(screen.getByTestId('bubble-state')).toHaveTextContent(
      'needs-review',
    );

    act(() => {
      mockCaptureCount = 0;
      captureSubscriber?.(0);
    });
    expect(screen.getByTestId('bubble-state')).toHaveTextContent('idle');
    expect(screen.getByTestId('bubble-badge-count')).toHaveTextContent('0');
  });
});

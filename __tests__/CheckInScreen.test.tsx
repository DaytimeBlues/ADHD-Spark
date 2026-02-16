import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import CheckInScreen, {
  getRecommendationAction,
} from '../src/screens/CheckInScreen';

const mockRequestPendingStart = jest.fn();

jest.mock('../src/services/ActivationService', () => ({
  __esModule: true,
  default: {
    requestPendingStart: (...args: unknown[]) =>
      mockRequestPendingStart(...args),
  },
}));

jest.mock('../src/components/ui/LinearButton', () => ({
  LinearButton: ({
    title,
    onPress,
  }: {
    title: string;
    onPress: () => void;
  }) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable onPress={onPress}>
        <Text>{title}</Text>
      </Pressable>
    );
  },
}));

describe('CheckInScreen', () => {
  beforeEach(() => {
    mockRequestPendingStart.mockReset();
    mockRequestPendingStart.mockResolvedValue(undefined);
  });

  it('maps high readiness to focus ignite action', () => {
    const action = getRecommendationAction(5, 5);
    expect(action.route).toBe('Focus');
    expect(action.cta).toBe('START IGNITE');
  });

  it('queues pending ignite start and navigates on high readiness CTA', async () => {
    const navigate = jest.fn();

    render(<CheckInScreen navigation={{ navigate }} />);

    fireEvent.press(screen.getByTestId('mood-option-5'));
    fireEvent.press(screen.getByTestId('energy-option-5'));

    const cta = await screen.findByText('START IGNITE');
    fireEvent.press(cta);

    expect(mockRequestPendingStart).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'checkin_prompt',
      }),
    );
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Focus');
    });
  });

  it('still navigates to focus when pending start queue fails', async () => {
    const navigate = jest.fn();
    mockRequestPendingStart.mockRejectedValueOnce(new Error('storage down'));

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(<CheckInScreen navigation={{ navigate }} />);

    fireEvent.press(screen.getByTestId('mood-option-5'));
    fireEvent.press(screen.getByTestId('energy-option-5'));

    const cta = await screen.findByText('START IGNITE');
    fireEvent.press(cta);

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Focus');
    });
    expect(warnSpy).toHaveBeenCalledWith(
      'Failed to queue pending ignite start from check-in:',
      expect.any(Error),
    );

    warnSpy.mockRestore();
  });
});

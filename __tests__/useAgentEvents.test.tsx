import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { useAgentEvents } from '../src/hooks/useAgentEvents';
import { agentEventBus } from '../src/services/AgentEventBus';

jest.mock('../src/services/AgentEventBus', () => ({
  agentEventBus: {
    on: jest.fn(),
  },
}));

const TestComponent = ({
  event,
  listener,
}: {
  event: 'navigate:screen';
  listener: (payload: { screen: string }) => void;
}) => {
  useAgentEvents(event, listener);
  return <Text>ready</Text>;
};

describe('useAgentEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the latest listener callback when props change', () => {
    const unsubscribe = jest.fn();
    let capturedListener: ((payload: { screen: string }) => void) | undefined;

    (agentEventBus.on as jest.Mock).mockImplementation(
      (_: 'navigate:screen', cb: (payload: { screen: string }) => void) => {
        capturedListener = cb;
        return unsubscribe;
      },
    );

    const first = jest.fn();
    const second = jest.fn();

    const { rerender } = render(
      <TestComponent event="navigate:screen" listener={first} />,
    );

    rerender(<TestComponent event="navigate:screen" listener={second} />);

    capturedListener?.({ screen: 'Home' });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith({ screen: 'Home' });
  });

  it('subscribes to agentEventBus and unsubscribes on unmount', () => {
    const unsubscribe = jest.fn();
    (agentEventBus.on as jest.Mock).mockReturnValue(unsubscribe);
    const listener = jest.fn();

    const { unmount } = render(
      <TestComponent event="navigate:screen" listener={listener} />,
    );

    expect(agentEventBus.on).toHaveBeenCalledWith(
      'navigate:screen',
      expect.any(Function),
    );

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});

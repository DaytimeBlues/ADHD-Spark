import { agentEventBus } from '../src/services/AgentEventBus';
import { LoggerService } from '../src/services/LoggerService';

jest.mock('../src/services/LoggerService', () => ({
  __esModule: true,
  LoggerService: {
    error: jest.fn(),
  },
}));

describe('AgentEventBus', () => {
  beforeEach(() => {
    agentEventBus.removeAllListeners();
    jest.clearAllMocks();
  });

  it('emits payload to subscribed listeners', () => {
    const listener = jest.fn();
    agentEventBus.on('timer:start', listener);

    agentEventBus.emit('timer:start', { timerType: 'pomodoro' });

    expect(listener).toHaveBeenCalledWith({ timerType: 'pomodoro' });
  });

  it('supports unsubscribe', () => {
    const listener = jest.fn();
    const unsubscribe = agentEventBus.on('braindump:add', listener);

    unsubscribe();
    agentEventBus.emit('braindump:add', { text: 'hello' });

    expect(listener).not.toHaveBeenCalled();
  });

  it('logs listener exceptions without throwing', () => {
    agentEventBus.on('navigate:screen', () => {
      throw new Error('boom');
    });

    expect(() => {
      agentEventBus.emit('navigate:screen', { screen: 'Home' });
    }).not.toThrow();

    expect(LoggerService.error).toHaveBeenCalled();
  });
});

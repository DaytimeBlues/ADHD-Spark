import { agentEventBus } from '../../src/services/AgentEventBus';

beforeEach(() => {
  agentEventBus.removeAllListeners();
});

describe('AgentEventBus', () => {
  it('delivers events to registered listeners', () => {
    const handler = jest.fn();
    agentEventBus.on('navigate:screen', handler);
    agentEventBus.emit('navigate:screen', { screen: 'Home' });
    expect(handler).toHaveBeenCalledWith({ screen: 'Home' });
  });

  it('unsubscribes via returned function', () => {
    const handler = jest.fn();
    const off = agentEventBus.on('timer:start', handler);
    off();
    agentEventBus.emit('timer:start', { timerType: 'ignite' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('supports multiple listeners on the same event', () => {
    const h1 = jest.fn();
    const h2 = jest.fn();
    agentEventBus.on('braindump:add', h1);
    agentEventBus.on('braindump:add', h2);
    agentEventBus.emit('braindump:add', { text: 'test' });
    expect(h1).toHaveBeenCalledTimes(1);
    expect(h2).toHaveBeenCalledTimes(1);
  });

  it('does not deliver events to other event listeners', () => {
    const handler = jest.fn();
    agentEventBus.on('navigate:screen', handler);
    agentEventBus.emit('timer:start', { timerType: 'pomodoro' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('does not throw when emitting with no listeners', () => {
    expect(() => {
      agentEventBus.emit('fogcutter:create', { taskTitle: 'test' });
    }).not.toThrow();
  });

  it('isolates listener errors and continues delivering to others', () => {
    const bad = jest.fn(() => {
      throw new Error('boom');
    });
    const good = jest.fn();
    agentEventBus.on('navigate:screen', bad);
    agentEventBus.on('navigate:screen', good);
    expect(() =>
      agentEventBus.emit('navigate:screen', { screen: 'Home' }),
    ).not.toThrow();
    expect(good).toHaveBeenCalled();
  });
});

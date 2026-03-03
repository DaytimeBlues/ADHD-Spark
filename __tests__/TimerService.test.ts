import { TimerService } from '../src/services/TimerService';
import { useTimerStore } from '../src/store/useTimerStore';

describe('TimerService', () => {
  beforeEach(() => {
    // Reset store state
    useTimerStore.setState({
      activeMode: null,
      isRunning: false,
      targetEndTime: null,
      remainingSeconds: 0,
      durationSeconds: 0,
      isWorking: true,
      sessions: 0,
      completedAt: null,
    });

    // Stop any running timer service
    TimerService.stop();
    jest.useFakeTimers();
  });

  afterEach(() => {
    TimerService.stop();
    jest.useRealTimers();
  });

  it('should be a singleton with required methods', () => {
    expect(TimerService).toBeDefined();
    expect(typeof TimerService.start).toBe('function');
    expect(typeof TimerService.stop).toBe('function');
    expect(typeof TimerService.updateTickRate).toBe('function');
  });

  it('should start the interval when start() is called', () => {
    const setIntervalSpy = jest.spyOn(global, 'setInterval');

    TimerService.start();

    expect(setIntervalSpy).toHaveBeenCalled();
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);

    setIntervalSpy.mockRestore();
  });

  it('should not create multiple intervals when start() is called multiple times', () => {
    const setIntervalSpy = jest.spyOn(global, 'setInterval');

    TimerService.start();
    TimerService.start();
    TimerService.start();

    expect(setIntervalSpy).toHaveBeenCalledTimes(1);

    setIntervalSpy.mockRestore();
  });

  it('should stop the interval when stop() is called', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    TimerService.start();
    TimerService.stop();

    expect(clearIntervalSpy).toHaveBeenCalled();

    clearIntervalSpy.mockRestore();
  });

  it('should update tick rate and restart interval when updateTickRate is called', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const setIntervalSpy = jest.spyOn(global, 'setInterval');

    TimerService.start();
    TimerService.updateTickRate(500);

    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(setIntervalSpy).toHaveBeenLastCalledWith(expect.any(Function), 500);

    clearIntervalSpy.mockRestore();
    setIntervalSpy.mockRestore();
  });

  it('should not restart interval when updateTickRate is called but interval is not running', () => {
    const setIntervalSpy = jest.spyOn(global, 'setInterval');

    TimerService.updateTickRate(500);

    expect(setIntervalSpy).not.toHaveBeenCalled();

    setIntervalSpy.mockRestore();
  });
});

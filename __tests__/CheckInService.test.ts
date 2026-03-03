import { CheckInService } from '../src/services/CheckInService';

describe('CheckInService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    CheckInService.stop();
    CheckInService.setPending(false);
  });

  afterEach(() => {
    CheckInService.stop();
    jest.useRealTimers();
  });

  it('notifies subscribers immediately with current state', () => {
    const callback = jest.fn();

    CheckInService.subscribe(callback);

    expect(callback).toHaveBeenCalledWith(false);
  });

  it('updates pending state and notifies subscribers', () => {
    const callback = jest.fn();
    CheckInService.subscribe(callback);

    CheckInService.setPending(true);

    expect(CheckInService.isPending()).toBe(true);
    expect(callback).toHaveBeenLastCalledWith(true);
  });

  it('sets pending after interval when started', () => {
    CheckInService.start(1000);

    jest.advanceTimersByTime(1000);

    expect(CheckInService.isPending()).toBe(true);
  });

  it('stops interval and prevents pending updates', () => {
    CheckInService.start(1000);
    CheckInService.stop();

    jest.advanceTimersByTime(1500);

    expect(CheckInService.isPending()).toBe(false);
  });

  it('unsubscribes listeners', () => {
    const callback = jest.fn();
    const unsubscribe = CheckInService.subscribe(callback);

    unsubscribe();
    CheckInService.setPending(true);

    expect(callback).toHaveBeenCalledTimes(1);
  });
});

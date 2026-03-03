import { renderHook, act } from '@testing-library/react-native';
import { useBiometric } from '../src/hooks/useBiometric';
import { BiometricService } from '../src/services/BiometricService';

// Mock BiometricService
jest.mock('../src/services/BiometricService', () => ({
  BiometricService: {
    subscribe: jest.fn(),
    authenticate: jest.fn(),
    toggleSecurity: jest.fn(),
    getIsSecured: jest.fn().mockReturnValue(false),
  },
}));

describe('useBiometric', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should subscribe to BiometricService on mount', () => {
    renderHook(() => useBiometric());

    expect(BiometricService.subscribe).toHaveBeenCalled();
  });

  it('should update isUnlocked when service notifies', () => {
    let subscriberCallback: ((unlocked: boolean) => void) | null = null;

    (BiometricService.subscribe as jest.Mock).mockImplementation(
      (cb: (unlocked: boolean) => void) => {
        subscriberCallback = cb;
        cb(true); // Initial call
        return jest.fn();
      },
    );

    const { result } = renderHook(() => useBiometric());

    expect(result.current.isUnlocked).toBe(true);

    // Simulate service update
    act(() => {
      subscriberCallback?.(false);
    });

    expect(result.current.isUnlocked).toBe(false);
  });

  it('should unsubscribe from BiometricService on unmount', () => {
    const unsubscribe = jest.fn();
    (BiometricService.subscribe as jest.Mock).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useBiometric());

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('should provide authenticate function', () => {
    const { result } = renderHook(() => useBiometric());

    expect(typeof result.current.authenticate).toBe('function');
  });

  it('should provide toggleSecurity function', () => {
    const { result } = renderHook(() => useBiometric());

    expect(typeof result.current.toggleSecurity).toBe('function');
  });

  it('should provide isSecured value', () => {
    const { result } = renderHook(() => useBiometric());

    expect(typeof result.current.isSecured).toBe('boolean');
  });

  it('should call BiometricService.authenticate when authenticate is called', () => {
    const { result } = renderHook(() => useBiometric());

    result.current.authenticate();

    expect(BiometricService.authenticate).toHaveBeenCalled();
  });

  it('should call BiometricService.toggleSecurity when toggleSecurity is called', () => {
    const { result } = renderHook(() => useBiometric());

    result.current.toggleSecurity(true);

    expect(BiometricService.toggleSecurity).toHaveBeenCalledWith(true);
  });
});

import { renderHook, waitFor } from '@testing-library/react-native';
import { useRetention } from '../src/hooks/useRetention';
import RetentionService from '../src/services/RetentionService';

// Mock RetentionService
jest.mock('../src/services/RetentionService', () => ({
  __esModule: true,
  default: {
    markAppUse: jest.fn().mockResolvedValue(5),
    getReentryPromptLevel: jest.fn().mockResolvedValue('none'),
  },
}));

describe('useRetention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should mark app use on mount', async () => {
    renderHook(() => useRetention());

    await waitFor(() => {
      expect(RetentionService.markAppUse).toHaveBeenCalled();
    });
  });

  it('should initialize streak from markAppUse result', async () => {
    (RetentionService.markAppUse as jest.Mock).mockResolvedValue(7);

    const { result } = renderHook(() => useRetention());

    await waitFor(() => {
      expect(result.current.streak).toBe(7);
    });
  });

  it('should initialize reentryLevel from getReentryPromptLevel result', async () => {
    (RetentionService.getReentryPromptLevel as jest.Mock).mockResolvedValue(
      'high',
    );

    const { result } = renderHook(() => useRetention());

    await waitFor(() => {
      expect(result.current.reentryLevel).toBe('high');
    });
  });

  it('should provide streak value', async () => {
    const { result } = renderHook(() => useRetention());

    await waitFor(() => {
      expect(typeof result.current.streak).toBe('number');
    });
  });

  it('should provide reentryLevel value', async () => {
    const { result } = renderHook(() => useRetention());

    await waitFor(() => {
      expect(result.current.reentryLevel).toBeDefined();
    });
  });
});

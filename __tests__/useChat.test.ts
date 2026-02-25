import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useChat } from '../src/hooks/useChat';
import ChatService, { ChatMessage } from '../src/services/ChatService';

// Mock ChatService
jest.mock('../src/services/ChatService', () => {
  const mockMessages: ChatMessage[] = [
    {
      id: 'system-1',
      role: 'system',
      content: 'System prompt',
      timestamp: Date.now(),
    },
  ];
  let subscribers: ((messages: ChatMessage[]) => void)[] = [];

  return {
    __esModule: true,
    default: {
      subscribe: jest.fn((callback: (messages: ChatMessage[]) => void) => {
        subscribers.push(callback);
        callback([...mockMessages]);
        return () => {
          subscribers = subscribers.filter((s) => s !== callback);
        };
      }),
      sendMessage: jest.fn(async (text: string) => {
        const userMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: text,
          timestamp: Date.now(),
        };
        mockMessages.push(userMsg);
        subscribers.forEach((s) => s([...mockMessages]));

        // Simulate assistant response
        setTimeout(() => {
          const assistantMsg: ChatMessage = {
            id: `msg-${Date.now()}-assistant`,
            role: 'assistant',
            content: 'Test response',
            timestamp: Date.now(),
          };
          mockMessages.push(assistantMsg);
          subscribers.forEach((s) => s([...mockMessages]));
        }, 10);
      }),
      clearHistory: jest.fn(() => {
        mockMessages.length = 1; // Keep system message
        subscribers.forEach((s) => s([...mockMessages]));
      }),
    },
    ChatError: class ChatError extends Error {
      code: string;

      constructor(code: string, message: string) {
        super(message);
        this.name = 'ChatError';
        this.code = code;
      }
    },
  };
});

describe('useChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should subscribe to ChatService on mount', () => {
    const { result } = renderHook(() => useChat());

    expect(ChatService.subscribe).toHaveBeenCalled();
    expect(result.current.messages).toBeDefined();
    expect(Array.isArray(result.current.messages)).toBe(true);
  });

  it('should unsubscribe from ChatService on unmount', () => {
    const { unmount } = renderHook(() => useChat());

    const unsubscribe = jest.fn();
    (ChatService.subscribe as jest.Mock).mockReturnValue(unsubscribe);

    unmount();

    // The unsubscribe function should be called on cleanup
    expect(ChatService.subscribe).toHaveBeenCalled();
  });

  it('should provide sendMessage function', () => {
    const { result } = renderHook(() => useChat());

    expect(typeof result.current.sendMessage).toBe('function');
  });

  it('should provide clearHistory function', () => {
    const { result } = renderHook(() => useChat());

    expect(typeof result.current.clearHistory).toBe('function');
  });

  it('should track loading state during send', async () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.sendMessage('Hello');
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should clear error when clearError is called', async () => {
    // Mock sendMessage to throw an error
    (ChatService.sendMessage as jest.Mock).mockRejectedValueOnce(
      new Error('Test error'),
    );

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.error).toBeTruthy();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});

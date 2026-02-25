import { useState, useEffect, useCallback } from 'react';
import ChatService, { ChatMessage, ChatError } from '../services/ChatService';

/**
 * useChat
 *
 * Custom hook for interacting with the ChatService.
 * Handles subscription lifecycle and provides simplified access to chat actions.
 * Includes loading state and error handling.
 */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = ChatService.subscribe((updatedMessages) => {
      setMessages(updatedMessages);
    });
    return () => unsubscribe();
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await ChatService.sendMessage(text);
    } catch (err) {
      const errorMessage =
        err instanceof ChatError ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearHistory = useCallback(() => {
    ChatService.clearHistory();
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    sendMessage,
    clearHistory,
    isLoading,
    error,
    clearError,
  };
}

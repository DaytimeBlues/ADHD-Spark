import { useState, useEffect } from 'react';
import ChatService, { ChatMessage } from '../services/ChatService';

/**
 * useChat
 *
 * Custom hook for interacting with the ChatService.
 * Handles subscription lifecycle and provides simplified access to chat actions.
 */
export function useChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    useEffect(() => {
        return ChatService.subscribe((updatedMessages) => {
            setMessages(updatedMessages);
        });
    }, []);

    const sendMessage = (text: string) => ChatService.sendMessage(text);
    const clearHistory = () => ChatService.clearHistory();

    return {
        messages,
        sendMessage,
        clearHistory,
    };
}

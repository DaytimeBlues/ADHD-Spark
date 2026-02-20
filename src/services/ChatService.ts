import { config } from '../config';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

export type ChatUpdateHandler = (messages: ChatMessage[]) => void;

/**
 * ChatService
 * 
 * Manages local chat history and communicates with the AI backend.
 * Features:
 * - Local-only history (no account required)
 * - System prompt injection (context-aware)
 * - Streaming-simulator (local typing feel)
 */
class ChatService {
    private messages: ChatMessage[] = [];
    private handlers: ChatUpdateHandler[] = [];

    private systemPrompt = `
    You are Spark, an AI assistant for Spark ADHD. 
    You are helpful, concise, and understand ADHD challenges (executive dysfunction, overwhelm).
    Encourage the user to use Spark's tools like Fog Cutter or Ignite.
    If the user seems overwhelmed, suggest a 5-minute task.
  `;

    constructor() {
        this.messages = [
            {
                id: 'initial',
                role: 'system',
                content: this.systemPrompt,
                timestamp: Date.now(),
            },
        ];
    }

    subscribe(handler: ChatUpdateHandler): () => void {
        this.handlers.push(handler);
        handler([...this.messages]);
        return () => {
            this.handlers = this.handlers.filter((h) => h !== handler);
        };
    }

    getMessages(): ChatMessage[] {
        return [...this.messages];
    }

    async sendMessage(text: string): Promise<void> {
        const userMsg: ChatMessage = {
            id: Math.random().toString(36).substring(7),
            role: 'user',
            content: text,
            timestamp: Date.now(),
        };

        this.messages.push(userMsg);
        this.notify();

        // Prepare AI response (simulated streaming for now)
        const assistantMsg: ChatMessage = {
            id: Math.random().toString(36).substring(7),
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
        };
        this.messages.push(assistantMsg);
        this.notify();

        try {
            const response = await fetch(`${config.apiBaseUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: this.messages.filter(m => m.role !== 'system').map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                }),
            });

            if (!response.ok) throw new Error('Chat API error');

            const data = await response.json();
            assistantMsg.content = data.reply || 'I am having trouble connecting to my brain. Please try again.';
            this.notify();
        } catch (error) {
            console.error('Chat failed', error);
            assistantMsg.content = 'Unable to reach AI service. Check your connection.';
            this.notify();
        }
    }

    private notify() {
        this.handlers.forEach((h) => h([...this.messages]));
    }

    clearHistory() {
        this.messages = [this.messages[0]]; // Keep system prompt
        this.notify();
    }
}

export default new ChatService();

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

    // Prepare AI response object
    const assistantMsg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    this.messages.push(assistantMsg);
    this.notify();

    try {
      if (config.aiProvider === 'kimi-direct') {
        await this.callKimiDirect(assistantMsg);
      } else {
        await this.callVercelBackend(assistantMsg);
      }
    } catch (error) {
      console.error('Chat failed', error);
      assistantMsg.content =
        'Unable to reach AI service. Check your connection.';
      this.notify();
    }
  }

  private async callKimiDirect(assistantMsg: ChatMessage): Promise<void> {
    if (!config.moonshotApiKey) {
      assistantMsg.content =
        'Moonshot API key is missing. Please set REACT_APP_MOONSHOT_API_KEY.';
      this.notify();
      return;
    }

    const response = await fetch(
      'https://api.moonshot.cn/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.moonshotApiKey}`,
        },
        body: JSON.stringify({
          model: config.kimiModel,
          messages: this.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          temperature: 0.7,
        }),
      },
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Kimi API Error:', errBody);
      throw new Error(`Kimi API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;

    assistantMsg.content = reply || 'Kimi returned an empty response.';
    this.notify();
  }

  private async callVercelBackend(assistantMsg: ChatMessage): Promise<void> {
    const response = await fetch(`${config.apiBaseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: this.messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({
            role: m.role,
            content: m.content,
          })),
      }),
    });

    if (!response.ok) {
      throw new Error('Chat API error');
    }

    const data = await response.json();
    assistantMsg.content =
      data.reply ||
      'I am having trouble connecting to my brain. Please try again.';
    this.notify();
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

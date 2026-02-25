import { config } from '../config';
import { generateId } from '../utils/helpers';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export type ChatUpdateHandler = (messages: ChatMessage[]) => void;

/** Structured error codes for contextual UI messages. */
export type ChatErrorCode =
  | 'CHAT_NETWORK'
  | 'CHAT_AUTH'
  | 'CHAT_SERVER_ERROR'
  | 'CHAT_UNKNOWN'
  | 'CHAT_INPUT_TOO_LONG'
  | 'CHAT_TIMEOUT';

export class ChatError extends Error {
  constructor(
    public readonly code: ChatErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ChatError';
  }
}

/**
 * ChatService
 *
 * Manages local chat history and communicates with the AI backend.
 * Features:
 * - Local-only history (no account required)
 * - System prompt injection (context-aware)
 * - Streaming-simulator (local typing feel)
 * - Input validation and sanitization
 * - Request timeout and retry with exponential backoff
 * - AbortController support for cancellation
 */
const MAX_HISTORY = 200;
const MAX_MESSAGE_LENGTH = 2000;

/**
 * Basic XSS sanitization - removes script tags and dangerous attributes.
 * This is a defense-in-depth measure; React Native also provides some protection.
 */
const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+\s+on\w+\s*=\s*["'][^"']*["']/gi, (match) => {
      // Remove event handlers from HTML tags
      return match.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
    })
    .replace(/javascript:/gi, '')
    .trim();
};

/**
 * Sleep helper for retry delays
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

class ChatService {
  private messages: ChatMessage[] = [];
  private handlers: ChatUpdateHandler[] = [];
  private abortController: AbortController | null = null;

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

  /**
   * Cancel any in-flight AI request
   */
  cancelRequest(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  async sendMessage(text: string): Promise<void> {
    // Input validation: message length
    if (!text || text.trim().length === 0) {
      return;
    }

    if (text.length > MAX_MESSAGE_LENGTH) {
      const errorMsg: ChatMessage = {
        id: `msg_${generateId()}`,
        role: 'assistant',
        content: `Message too long. Please keep messages under ${MAX_MESSAGE_LENGTH} characters.`,
        timestamp: Date.now(),
      };
      this.messages.push(errorMsg);
      this.notify();
      throw new ChatError(
        'CHAT_INPUT_TOO_LONG',
        `Message exceeds ${MAX_MESSAGE_LENGTH} character limit`,
      );
    }

    // XSS sanitization
    const sanitizedText = sanitizeInput(text);

    const userMsg: ChatMessage = {
      id: `msg_${generateId()}`,
      role: 'user',
      content: sanitizedText,
      timestamp: Date.now(),
    };

    this.messages.push(userMsg);
    this.trimHistory();
    this.notify();

    // Prepare AI response object
    const assistantMsg: ChatMessage = {
      id: `msg_${generateId()}`,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    this.messages.push(assistantMsg);
    this.notify();

    // Create new AbortController for this request
    this.abortController = new AbortController();

    try {
      if (config.aiProvider === 'kimi-direct') {
        await this.callWithRetry(() => this.callKimiDirect(assistantMsg));
      } else {
        await this.callWithRetry(() => this.callVercelBackend(assistantMsg));
      }
    } catch (error) {
      const chatError = this.classifyError(error);
      console.error('Chat failed:', chatError);
      assistantMsg.content = chatError.message;
      this.notify();
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Retry wrapper with exponential backoff
   */
  private async callWithRetry(operation: () => Promise<void>): Promise<void> {
    const maxRetries = config.aiMaxRetries;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await operation();
        return; // Success
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (error instanceof ChatError && error.code === 'CHAT_AUTH') {
          throw error;
        }

        // Check if it's an HTTP 4xx error (except 429)
        if (
          lastError.message.includes('400') ||
          lastError.message.includes('401') ||
          lastError.message.includes('403') ||
          lastError.message.includes('404')
        ) {
          throw error;
        }

        // Don't retry if this was an abort
        if (error instanceof Error && error.name === 'AbortError') {
          throw new ChatError('CHAT_TIMEOUT', 'Request was cancelled.');
        }

        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
          console.log(
            `Chat retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`,
          );
          await sleep(delay);
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  private classifyError(error: unknown): ChatError {
    if (error instanceof ChatError) {
      return error;
    }

    const msg = error instanceof Error ? error.message.toLowerCase() : '';
    if (msg.includes('abort') || msg.includes('cancelled')) {
      return new ChatError('CHAT_TIMEOUT', 'Request was cancelled.');
    }
    if (msg.includes('timeout')) {
      return new ChatError(
        'CHAT_TIMEOUT',
        'The AI is taking too long to respond. Please try again.',
      );
    }
    if (msg.includes('network') || msg.includes('failed to fetch')) {
      return new ChatError(
        'CHAT_NETWORK',
        'Unable to reach AI service. Check your connection.',
      );
    }
    if (msg.includes('401') || msg.includes('403') || msg.includes('auth')) {
      return new ChatError(
        'CHAT_AUTH',
        'AI authentication failed. Please check configuration.',
      );
    }
    return new ChatError(
      'CHAT_UNKNOWN',
      'I am having trouble connecting to my brain. Please try again.',
    );
  }

  private async callKimiDirect(assistantMsg: ChatMessage): Promise<void> {
    if (!config.moonshotApiKey) {
      assistantMsg.content =
        'Moonshot API key is missing. Please set EXPO_PUBLIC_MOONSHOT_API_KEY.';
      this.notify();
      return;
    }

    // WARNING: API key is sent client-side. This should be routed through a
    // server-side proxy (e.g. /api/chat?provider=kimi) to avoid key exposure.
    // See implementation_plan.md S1/S2 for the recommended migration path.
    if (__DEV__) {
      console.warn(
        'ChatService: kimi-direct sends API key from client. Use a server proxy in production.',
      );
    }

    const timeoutMs = config.aiTimeout;
    const timeoutId = setTimeout(() => {
      this.abortController?.abort();
    }, timeoutMs);

    try {
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
          signal: this.abortController?.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errBody = await response.text();
        console.error('Kimi API Error:', errBody);
        throw new Error(`Kimi API error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content;

      assistantMsg.content = reply || 'Kimi returned an empty response.';
      this.notify();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async callVercelBackend(assistantMsg: ChatMessage): Promise<void> {
    const timeoutMs = config.aiTimeout;
    const timeoutId = setTimeout(() => {
      this.abortController?.abort();
    }, timeoutMs);

    try {
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
        signal: this.abortController?.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Chat API error');
      }

      const data = await response.json();
      assistantMsg.content =
        data.reply ||
        'I am having trouble connecting to my brain. Please try again.';
      this.notify();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private notify() {
    this.handlers.forEach((h) => h([...this.messages]));
  }

  /** Trim history to MAX_HISTORY, always preserving the system prompt. */
  private trimHistory() {
    if (this.messages.length > MAX_HISTORY) {
      const systemMsg = this.messages[0];
      this.messages = [systemMsg, ...this.messages.slice(-(MAX_HISTORY - 1))];
    }
  }

  clearHistory() {
    this.messages = [this.messages[0]]; // Keep system prompt
    this.notify();
  }
}

export default new ChatService();

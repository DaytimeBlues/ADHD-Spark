import ChatService, { ChatError } from '../src/services/ChatService';
import { config } from '../src/config';

describe('ChatService', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    ChatService.clearHistory();
    config.aiTimeout = 5000;
    config.aiMaxRetries = 0;
    config.apiBaseUrl = 'https://test.local';
    config.aiProvider = 'vercel';
    config.moonshotApiKey = 'test-key';
    config.kimiModel = 'kimi-k2.5';
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('subscribes and unsubscribes listeners', () => {
    const handler = jest.fn();
    const unsubscribe = ChatService.subscribe(handler);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0][0].role).toBe('system');

    unsubscribe();
    handler.mockClear();

    ChatService.clearHistory();
    expect(handler).not.toHaveBeenCalled();
  });

  it('sends a message through the Vercel provider', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reply: 'Hello from Vercel' }),
    } as Response);

    await ChatService.sendMessage('Hi');

    const messages = ChatService.getMessages();
    expect(messages[messages.length - 1].role).toBe('assistant');
    expect(messages[messages.length - 1].content).toBe('Hello from Vercel');
  });

  it('sends a message through the Kimi provider', async () => {
    config.aiProvider = 'kimi-direct';

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Hello from Kimi' } }],
      }),
    } as Response);

    await ChatService.sendMessage('Hello Kimi');

    const messages = ChatService.getMessages();
    expect(messages[messages.length - 1].role).toBe('assistant');
    expect(messages[messages.length - 1].content).toBe('Hello from Kimi');
  });

  it('handles network failures with user-friendly error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Failed to fetch'));

    await ChatService.sendMessage('Can you help?');

    const messages = ChatService.getMessages();
    expect(messages[messages.length - 1].role).toBe('assistant');
    expect(messages[messages.length - 1].content).toContain(
      'Unable to reach AI service',
    );
  });

  it('rejects messages that exceed max length', async () => {
    await expect(
      ChatService.sendMessage('x'.repeat(2001)),
    ).rejects.toBeInstanceOf(ChatError);

    const messages = ChatService.getMessages();
    expect(messages[messages.length - 1].content).toContain(
      'Please keep messages under 2000 characters',
    );
  });

  it('clearHistory preserves only system prompt', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reply: 'Done' }),
    } as Response);

    await ChatService.sendMessage('test');
    expect(ChatService.getMessages().length).toBeGreaterThan(1);

    ChatService.clearHistory();

    const messages = ChatService.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0].role).toBe('system');
  });
});

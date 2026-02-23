import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PlaudService, {
  GoogleTasksSyncService,
} from '../src/services/PlaudService';

// Mock fetch
// @ts-ignore
global.fetch = jest.fn();

// Mock Platform more deeply
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios', // Default
  select: jest.fn(
    (dict: { ios?: unknown; default?: unknown }) => dict.ios || dict.default,
  ),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock GoogleSignin
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
    signInSilently: jest.fn(),
    getTokens: jest.fn(),
  },
}));

describe('PlaudService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    PlaudService.setApiUrl('https://test-api.vercel.app');
    (fetch as jest.Mock).mockReset();
    (AsyncStorage.getItem as jest.Mock).mockReset();
    (AsyncStorage.setItem as jest.Mock).mockReset();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('transcribe', () => {
    it('should handle successful transcription on Web', async () => {
      // Mock web platform
      // @ts-ignore
      Platform.OS = 'web';
      // @ts-ignore
      Platform.select.mockImplementation((dict) => dict.web || dict.default);

      // Create a mock Blob that looks like a real one for FormData
      const mockBlob = {
        size: 1024,
        type: 'audio/m4a',
        [Symbol.toStringTag]: 'Blob',
      };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          blob: jest.fn().mockResolvedValue(mockBlob),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            success: true,
            transcription: 'Hello world',
            summary: 'Greeting',
          }),
        });

      const result = await PlaudService.transcribe('blob:test-uri');

      expect(result.success).toBe(true);
      expect(result.transcription).toBe('Hello world');
    });

    it('should handle successful transcription on Native', async () => {
      // Mock native platform
      // @ts-ignore
      Platform.OS = 'ios';
      // @ts-ignore
      Platform.select.mockImplementation((dict) => dict.ios || dict.default);

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          transcription: 'Native world',
        }),
      });

      const result = await PlaudService.transcribe('file://test-path.m4a');

      expect(result.success).toBe(true);
      expect(result.transcription).toBe('Native world');
    });

    it('should handle API error responses', async () => {
      // @ts-ignore
      Platform.OS = 'ios';

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({ error: 'Server Error' }),
      });

      const result = await PlaudService.transcribe('file://test.m4a');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Server Error');
    });

    it('should handle network exceptions', async () => {
      // @ts-ignore
      Platform.OS = 'ios';
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Fail'));

      const result = await PlaudService.transcribe('file://test.m4a');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network Fail');
    });
  });

  describe('healthCheck', () => {
    it('should return true when API is reachable', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ status: 200 });

      const result = await PlaudService.healthCheck();
      expect(result).toBe(true);
    });

    it('should return false when API is unreachable', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Down'));

      const result = await PlaudService.healthCheck();
      expect(result).toBe(false);
    });
  });

  describe('GoogleTasksSyncService.syncSortedItemsToGoogle', () => {
    it('creates Google task and calendar event from sorted items', async () => {
      // @ts-ignore
      Platform.OS = 'android';

      const {
        GoogleSignin,
      } = require('@react-native-google-signin/google-signin');
      GoogleSignin.signInSilently.mockResolvedValue({});
      GoogleSignin.getTokens.mockResolvedValue({ accessToken: 'token-123' });

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            items: [{ id: 'list-1', title: 'Spark Inbox' }],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ id: 'task-1' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ id: 'event-1' }),
        });

      const result = await GoogleTasksSyncService.syncSortedItemsToGoogle([
        { text: 'Buy groceries', category: 'task', priority: 'high' },
        {
          text: 'Dentist appointment',
          category: 'event',
          priority: 'medium',
          start: '2026-02-17T09:00:00.000Z',
          end: '2026-02-17T10:00:00.000Z',
        },
      ]);

      expect(result.authRequired).toBe(false);
      expect(result.createdTasks).toBe(1);
      expect(result.createdEvents).toBe(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/lists/list-1/tasks'),
        expect.objectContaining({ method: 'POST' }),
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/calendars/primary/events'),
        expect.objectContaining({ method: 'POST' }),
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'googleTasksExportedFingerprints',
        expect.any(String),
      );
    });

    it('returns authRequired when Google token cannot be acquired', async () => {
      // @ts-ignore
      Platform.OS = 'android';

      const {
        GoogleSignin,
      } = require('@react-native-google-signin/google-signin');
      GoogleSignin.signInSilently.mockRejectedValue(new Error('not signed in'));

      const result = await GoogleTasksSyncService.syncSortedItemsToGoogle([
        { text: 'Pay rent', category: 'task', priority: 'high' },
      ]);

      expect(result.authRequired).toBe(true);
      expect(result.skippedCount).toBe(1);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('skips duplicate fingerprints from prior exports', async () => {
      // @ts-ignore
      Platform.OS = 'android';

      const {
        GoogleSignin,
      } = require('@react-native-google-signin/google-signin');
      GoogleSignin.signInSilently.mockResolvedValue({});
      GoogleSignin.getTokens.mockResolvedValue({ accessToken: 'token-123' });

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'googleTasksExportedFingerprints') {
          return Promise.resolve(JSON.stringify(['task|buy milk|||']));
        }
        return Promise.resolve(null);
      });

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          items: [{ id: 'list-1', title: 'Spark Inbox' }],
        }),
      });

      const result = await GoogleTasksSyncService.syncSortedItemsToGoogle([
        { text: ' Buy milk ', category: 'task', priority: 'medium' },
      ]);

      expect(result.createdTasks).toBe(0);
      expect(result.skippedCount).toBe(1);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});

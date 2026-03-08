import { LoggerService } from '../src/services/LoggerService';
import TranscriptionService from '../src/services/TranscriptionService';

type SparkTestGlobals = typeof globalThis & {
  __SPARK_E2E_TEST_MODE__?: boolean;
  __SPARK_E2E_TRANSCRIBE_MOCK__?: string;
};

jest.mock('../src/services/LoggerService', () => ({
  __esModule: true,
  LoggerService: {
    error: jest.fn(),
  },
}));

describe('TranscriptionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const sparkGlobal = globalThis as SparkTestGlobals;
    sparkGlobal.__SPARK_E2E_TEST_MODE__ = undefined;
    sparkGlobal.__SPARK_E2E_TRANSCRIBE_MOCK__ = undefined;
  });

  it('returns e2e mock transcription when test mode enabled', async () => {
    const sparkGlobal = globalThis as SparkTestGlobals;
    sparkGlobal.__SPARK_E2E_TEST_MODE__ = true;
    sparkGlobal.__SPARK_E2E_TRANSCRIBE_MOCK__ = 'mock transcript';

    const result = await TranscriptionService.transcribe('mock://audio');

    expect(result.success).toBe(true);
    expect(result.transcription).toBe('mock transcript');
  });

  it('returns failure and logs when fetch throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network down'));

    const result = await TranscriptionService.transcribe('file://audio.m4a');

    expect(result.success).toBe(false);
    expect(LoggerService.error).toHaveBeenCalled();
  });
});

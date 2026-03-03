import { Platform } from 'react-native';
import { config } from '../config';
import { LoggerService } from './LoggerService';

/**
 * TranscriptionService
 *
 * Handles audio transcription via the Spark ADHD API middleware.
 * Extracted from the original PlaudService.
 */

export interface TranscriptionResult {
  success: boolean;
  transcription?: string;
  summary?: string;
  error?: string;
}

type RNFormDataFile = {
  uri: string;
  type: string;
  name: string;
};

class TranscriptionServiceClass {
  private apiUrl: string;

  constructor() {
    this.apiUrl = config.apiBaseUrl;
  }

  /**
   * Set the API base URL (for testing or different environments)
   */
  setApiUrl(url: string): void {
    this.apiUrl = url;
  }

  /**
   * Upload audio file and get transcription
   *
   * @param audioUri - Local URI of the audio file
   * @returns Transcription result
   */
  async transcribe(audioUri: string): Promise<TranscriptionResult> {
    const globalRecord =
      typeof globalThis === 'undefined'
        ? null
        : (globalThis as unknown as Record<string, unknown>);
    if (globalRecord?.__SPARK_E2E_TEST_MODE__ === true) {
      const mockTranscription = globalRecord.__SPARK_E2E_TRANSCRIBE_MOCK__;
      if (typeof mockTranscription === 'string' && mockTranscription.trim()) {
        return {
          success: true,
          transcription: mockTranscription,
          summary: 'E2E mock transcription',
        };
      }
    }

    try {
      // Read audio file and create form data
      const formData = new FormData();

      // Handle different platforms
      if (Platform.OS === 'web') {
        const response = await fetch(audioUri);
        const blob = await response.blob();
        formData.append('audio', blob);
      } else {
        const file: RNFormDataFile = {
          uri: audioUri,
          type: 'audio/m4a',
          name: 'recording.m4a',
        };
        formData.append('audio', file as unknown as Blob);
      }

      // Send to middleware
      const response = await fetch(`${this.apiUrl}/api/transcribe`, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error:
            errorData.error || `Request failed with status ${response.status}`,
        };
      }

      const data = await response.json();

      return {
        success: true,
        transcription: data.transcription,
        summary: data.summary,
      };
    } catch (error) {
      LoggerService.error({
        service: 'TranscriptionService',
        operation: 'transcribe',
        message: 'Transcription error',
        error,
        context: { audioUri },
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if the Transcription API is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth`, {
        method: 'POST',
      });
      return response.status !== 0;
    } catch {
      return false;
    }
  }
}

export const TranscriptionService = new TranscriptionServiceClass();
export default TranscriptionService;

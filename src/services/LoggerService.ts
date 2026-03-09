/**
 * LoggerService
 *
 * Centralized structured logging for the application.
 * Replaces bare console.* calls with context-rich, environment-aware logging.
 *
 * Usage:
 *   LoggerService.error({
 *     service: 'StorageService',
 *     operation: 'getItem',
 *     error: caughtError,
 *     context: { key: 'user-preferences' }
 *   });
 */

import { config } from '../config';
import type { OperationContext } from './OperationContext';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  service: string;
  operation: string;
  message?: string;
  error?: Error | unknown;
  context?: LogContext;
  correlationId?: string;
  sessionId?: string;
  feature?: string;
  platform?: string;
  timestamp: string;
}

class LoggerServiceClass {
  private isDev: boolean;
  private isTest: boolean;

  constructor() {
    this.isDev = config.environment === 'development';
    this.isTest = process.env.NODE_ENV === 'test';
  }

  /**
   * Log a debug message (development only)
   */
  public debug(entry: Omit<LogEntry, 'level' | 'timestamp'>): void {
    if (!this.isDev) {
      return;
    }
    this.log({ ...entry, level: 'debug' });
  }

  /**
   * Log an informational message
   */
  public info(entry: Omit<LogEntry, 'level' | 'timestamp'>): void {
    this.log({ ...entry, level: 'info' });
  }

  /**
   * Log a warning message
   */
  public warn(entry: Omit<LogEntry, 'level' | 'timestamp'>): void {
    this.log({ ...entry, level: 'warn' });
  }

  /**
   * Log an error message
   */
  public error(entry: Omit<LogEntry, 'level' | 'timestamp'>): void {
    this.log({ ...entry, level: 'error' });
  }

  /**
   * Log a fatal error (application cannot continue)
   */
  public fatal(entry: Omit<LogEntry, 'level' | 'timestamp'>): void {
    this.log({ ...entry, level: 'fatal' });
  }

  private log(entry: Omit<LogEntry, 'timestamp'>): void {
    if (this.isTest && process.env.SHOW_TEST_LOGS !== 'true') {
      return;
    }

    const timestamp = new Date().toISOString();
    const fullEntry: LogEntry = { ...entry, timestamp };

    if (this.isDev) {
      this.logToConsole(fullEntry);
    } else {
      this.logToProduction(fullEntry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const {
      level,
      service,
      operation,
      message,
      error,
      context,
      timestamp,
      correlationId,
      sessionId,
      feature,
      platform,
    } = entry;

    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${service}.${operation}]`;

    // Choose appropriate console method
    const consoleMethod = this.getConsoleMethod(level);

    // Build the log arguments
    const args: unknown[] = [prefix];

    if (message) {
      args.push(message);
    }

    if (error) {
      if (error instanceof Error) {
        args.push(`Error: ${error.message}`);
        if (error.stack) {
          args.push(`Stack: ${error.stack}`);
        }
      } else {
        args.push('Error:', error);
      }
    }

    if (context && Object.keys(context).length > 0) {
      args.push('Context:', context);
    }

    const traceFields = {
      correlationId,
      sessionId,
      feature,
      platform,
    };

    if (Object.values(traceFields).some((value) => value !== undefined)) {
      args.push('Trace:', traceFields);
    }

    consoleMethod(...args);
  }

  private logToProduction(entry: LogEntry): void {
    if (entry.level === 'debug') {
      return;
    }

    const payload = {
      timestamp: entry.timestamp,
      level: entry.level,
      service: entry.service,
      operation: entry.operation,
      message: entry.message,
      context: entry.context,
      correlationId: entry.correlationId,
      sessionId: entry.sessionId,
      feature: entry.feature,
      platform: entry.platform,
      error:
        entry.error instanceof Error
          ? {
              message: entry.error.message,
              stack: entry.error.stack,
              name: entry.error.name,
            }
          : entry.error,
    };

    const serialized = JSON.stringify(payload);
    if (entry.level === 'error' || entry.level === 'fatal') {
      console.error(serialized);
      return;
    }

    console.warn(serialized);
  }

  private getConsoleMethod(level: LogLevel): (...args: unknown[]) => void {
    switch (level) {
      case 'debug':
      case 'info':
      case 'warn':
        return console.warn;
      case 'error':
      case 'fatal':
        return console.error;
      default:
        return console.warn;
    }
  }
}

export const LoggerService = new LoggerServiceClass();
export default LoggerService;

export const withOperationContext = (
  entry: Omit<LogEntry, 'level' | 'timestamp'>,
  operationContext?: OperationContext,
): Omit<LogEntry, 'level' | 'timestamp'> => {
  if (!operationContext) {
    return entry;
  }

  return {
    ...entry,
    correlationId: operationContext.correlationId,
    sessionId: operationContext.sessionId,
    feature: operationContext.feature,
    platform: operationContext.platform,
  };
};

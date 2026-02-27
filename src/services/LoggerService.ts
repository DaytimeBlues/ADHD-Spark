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
  timestamp: string;
}

class LoggerServiceClass {
  private isDev: boolean;

  constructor() {
    this.isDev = config.environment === 'development';
  }

  /**
   * Log a debug message (development only)
   */
  public debug(entry: Omit<LogEntry, 'level' | 'timestamp'>): void {
    if (!this.isDev) return;
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
    const timestamp = new Date().toISOString();
    const fullEntry: LogEntry = { ...entry, timestamp };

    if (this.isDev) {
      this.logToConsole(fullEntry);
    } else {
      this.logToProduction(fullEntry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const { level, service, operation, message, error, context, timestamp } = entry;
    
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
    
    consoleMethod(...args);
  }

  private logToProduction(entry: LogEntry): void {
    // In production, we could send to Sentry, LogRocket, or other services
    // For now, use console.error for errors/fatals so they're captured by crash reporters
    
    if (entry.level === 'error' || entry.level === 'fatal') {
      // Structured logging for production error tracking
      const errorPayload = {
        timestamp: entry.timestamp,
        level: entry.level,
        service: entry.service,
        operation: entry.operation,
        message: entry.message,
        context: entry.context,
        // Include error details if present
        error: entry.error instanceof Error 
          ? { message: entry.error.message, stack: entry.error.stack, name: entry.error.name }
          : entry.error,
      };
      
      // Use console.error so Sentry or other crash reporters can capture it
      console.error(JSON.stringify(errorPayload));
    }
    
    // For non-error levels in production, we could send to a logging service
    // or simply suppress them depending on requirements
  }

  private getConsoleMethod(level: LogLevel): (...args: unknown[]) => void {
    switch (level) {
      case 'debug':
        return console.log;
      case 'info':
        return console.info;
      case 'warn':
        return console.warn;
      case 'error':
      case 'fatal':
        return console.error;
      default:
        return console.log;
    }
  }
}

export const LoggerService = new LoggerServiceClass();
export default LoggerService;

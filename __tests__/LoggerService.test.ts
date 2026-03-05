const loadLoggerService = (environment: 'development' | 'production') => {
  jest.resetModules();
  jest.doMock('../src/config', () => ({
    __esModule: true,
    config: { environment },
  }));

  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  const { LoggerService } = require('../src/services/LoggerService');
  return { LoggerService, warnSpy, errorSpy };
};

describe('LoggerService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('logs debug and info entries in development', () => {
    const { LoggerService, warnSpy } = loadLoggerService('development');

    LoggerService.debug({
      service: 'DebugService',
      operation: 'debugOp',
      message: 'debug message',
    });

    LoggerService.info({
      service: 'TestService',
      operation: 'testOp',
      message: 'info message',
      context: { runId: '123' },
    });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[DEBUG] [DebugService.debugOp]'),
      'debug message',
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[INFO] [TestService.testOp]'),
      'info message',
      'Context:',
      { runId: '123' },
    );
  });

  it('suppresses debug/info/warn in production', () => {
    const { LoggerService, warnSpy, errorSpy } =
      loadLoggerService('production');

    LoggerService.debug({
      service: 'DebugService',
      operation: 'quiet',
      message: 'no-op',
    });
    LoggerService.info({
      service: 'TestService',
      operation: 'quiet',
      message: 'should not print',
    });
    LoggerService.warn({
      service: 'TestService',
      operation: 'quiet',
      message: 'should not print',
    });

    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('emits structured JSON for production errors', () => {
    const { LoggerService, errorSpy } = loadLoggerService('production');

    LoggerService.error({
      service: 'OAuthService',
      operation: 'refreshGoogleToken',
      message: 'refresh failed',
      error: new Error('token expired'),
      context: { userId: 'abc' },
    });

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(errorSpy.mock.calls[0][0] as string);
    expect(payload.level).toBe('error');
    expect(payload.service).toBe('OAuthService');
    expect(payload.operation).toBe('refreshGoogleToken');
    expect(payload.message).toBe('refresh failed');
    expect(payload.context).toEqual({ userId: 'abc' });
    expect(payload.error.message).toBe('token expired');
  });

  it('logs non-Error payloads and fatal entries in development', () => {
    const { LoggerService, errorSpy } = loadLoggerService('development');

    LoggerService.error({
      service: 'StorageService',
      operation: 'setItem',
      error: { code: 'E_WRITE' },
      message: 'Write failed',
    });

    LoggerService.fatal({
      service: 'App',
      operation: 'bootstrap',
      message: 'fatal failure',
    });

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR] [StorageService.setItem]'),
      'Write failed',
      'Error:',
      { code: 'E_WRITE' },
    );
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[FATAL] [App.bootstrap]'),
      'fatal failure',
    );
  });

  it('includes stack details when logging Error instances in development', () => {
    const { LoggerService, errorSpy } = loadLoggerService('development');
    const err = new Error('boom');
    err.stack = 'custom-stack';

    LoggerService.error({
      service: 'StackService',
      operation: 'explode',
      message: 'with stack',
      error: err,
    });

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR] [StackService.explode]'),
      'with stack',
      'Error: boom',
      'Stack: custom-stack',
    );
  });

  it('falls back to console.warn for unknown levels', () => {
    const { LoggerService, warnSpy } = loadLoggerService('development');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const method = (LoggerService as any).getConsoleMethod('mystery');

    method('unknown');
    expect(warnSpy).toHaveBeenCalledWith('unknown');
  });
});

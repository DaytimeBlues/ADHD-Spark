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

  it('logs info entries with context in development', () => {
    const { LoggerService, warnSpy } = loadLoggerService('development');

    LoggerService.info({
      service: 'TestService',
      operation: 'testOp',
      message: 'info message',
      context: { runId: '123' },
    });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[INFO] [TestService.testOp]'),
      'info message',
      'Context:',
      { runId: '123' },
    );
  });

  it('suppresses non-error logs in production', () => {
    const { LoggerService, warnSpy, errorSpy } = loadLoggerService('production');

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

  it('routes fatal logs to console.error in development', () => {
    const { LoggerService, errorSpy } = loadLoggerService('development');

    LoggerService.fatal({
      service: 'App',
      operation: 'bootstrap',
      message: 'fatal failure',
    });

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[FATAL] [App.bootstrap]'),
      'fatal failure',
    );
  });
});

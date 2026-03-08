/* eslint-disable no-console */
describe('LoggerService', () => {
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.resetModules();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  });

  it('includes correlation metadata in production JSON logs', () => {
    jest.doMock('../src/config', () => ({
      config: { environment: 'production' },
    }));

    const { LoggerService } =
      require('../src/services/LoggerService') as typeof import('../src/services/LoggerService');

    LoggerService.info({
      service: 'ExampleService',
      operation: 'run',
      message: 'hello',
      correlationId: 'corr-123',
      feature: 'example',
      platform: 'web',
    });

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('"correlationId":"corr-123"'),
    );
  });
});

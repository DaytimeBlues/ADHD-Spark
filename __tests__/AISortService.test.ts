describe('AISortService timeout handling', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.dontMock('react-native');
    jest.dontMock('../src/services/network/requestPolicy');
  });

  it('preserves timeout classification and skips retries for RequestTimeoutError', async () => {
    jest.doMock('react-native', () => ({
      Platform: { OS: 'test' },
    }));

    jest.doMock('../src/services/network/requestPolicy', () => {
      const actual = jest.requireActual(
        '../src/services/network/requestPolicy',
      ) as typeof import('../src/services/network/requestPolicy');

      return {
        ...actual,
        fetchWithPolicy: jest.fn(),
        sleep: jest.fn(() => Promise.resolve()),
      };
    });

    const AISortService = require('../src/services/AISortService')
      .default as typeof import('../src/services/AISortService').default;
    const requestPolicy =
      require('../src/services/network/requestPolicy') as typeof import('../src/services/network/requestPolicy');

    const fetchWithPolicyMock = jest.mocked(requestPolicy.fetchWithPolicy);
    const sleepMock = jest.mocked(requestPolicy.sleep);

    fetchWithPolicyMock.mockRejectedValue(
      new requestPolicy.RequestTimeoutError(),
    );

    await expect(AISortService.sortItems(['alpha'])).rejects.toMatchObject({
      code: 'AI_TIMEOUT',
      message: 'AI sort timed out. Please try again.',
    });

    expect(fetchWithPolicyMock).toHaveBeenCalledTimes(1);
    expect(sleepMock).not.toHaveBeenCalled();
  });
});

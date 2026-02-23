import FogCutterAIService from '../../src/services/FogCutterAIService';

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('FogCutterAIService.generateMicroSteps', () => {
  it('returns default steps for empty input', async () => {
    const steps = await FogCutterAIService.generateMicroSteps('');
    expect(steps).toEqual(FogCutterAIService.defaultSteps);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns ai steps on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        steps: ['Open the tax app', 'Gather receipts folder', 'Start with Q1'],
      }),
    });

    const steps = await FogCutterAIService.generateMicroSteps('Do taxes');
    expect(steps).toHaveLength(3);
    expect(steps[0].text).toBe('Open the tax app');
    expect(steps[0].id).toBe('1');
  });

  it('falls back to defaults on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));
    const steps = await FogCutterAIService.generateMicroSteps('Do taxes');
    expect(steps).toEqual(FogCutterAIService.defaultSteps);
  });

  it('falls back to defaults on bad response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ bad: 'data' }),
    });
    const steps = await FogCutterAIService.generateMicroSteps('Do taxes');
    expect(steps).toEqual(FogCutterAIService.defaultSteps);
  });

  it('falls back to defaults on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
    const steps = await FogCutterAIService.generateMicroSteps('Do taxes');
    expect(steps).toEqual(FogCutterAIService.defaultSteps);
  });

  it('caps steps at 5 even if API returns more', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        steps: ['1', '2', '3', '4', '5', '6', '7'],
      }),
    });
    const steps = await FogCutterAIService.generateMicroSteps('Big task');
    expect(steps).toHaveLength(5);
  });
});

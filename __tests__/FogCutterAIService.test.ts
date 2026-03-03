import FogCutterAIService from '../src/services/FogCutterAIService';

describe('FogCutterAIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns fallback when task title is empty', async () => {
    const steps = await FogCutterAIService.generateMicroSteps('   ');
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].text).toContain('Write down');
  });

  it('returns parsed API steps when response is valid', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ steps: ['Step A', 'Step B'] }),
    } as unknown as Response);

    const steps = await FogCutterAIService.generateMicroSteps('Plan project');
    expect(steps).toEqual([
      { id: '1', text: 'Step A' },
      { id: '2', text: 'Step B' },
    ]);
  });

  it('falls back when API returns non-ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false } as Response);
    const steps = await FogCutterAIService.generateMicroSteps('Task');
    expect(steps[0].text).toContain('Write down');
  });
});

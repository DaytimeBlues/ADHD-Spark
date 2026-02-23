import { device, element, by } from 'detox';

describe('Screenshots', () => {
  it('should capture Home screen', async () => {
    await device.takeScreenshot('Home');
  });

  it('should navigate to Ignite (Focus tab) and capture screenshot', async () => {
    await element(by.id('tab-focus')).tap();
    await device.takeScreenshot('Focus_Ignite');
  });

  it('should navigate to BrainDump (Tasks tab) and capture screenshot', async () => {
    await element(by.id('tab-tasks')).tap();
    await device.takeScreenshot('Tasks_BrainDump');
  });

  it('should navigate back to Home and go to Fog Cutter', async () => {
    await element(by.id('tab-home')).tap();
    await element(by.id('mode-fogcutter')).tap();
    await device.takeScreenshot('FogCutter');
  });
});

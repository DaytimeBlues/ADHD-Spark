import type { Page } from '@playwright/test';

export const gotoAppRoot = async (page: Page): Promise<void> => {
  await page.goto('.', { timeout: 30000 });
};

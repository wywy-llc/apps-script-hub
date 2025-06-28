import { expect, test } from '@playwright/test';
import { clearTestDataBeforeTest } from './test-utils.js';

test('home page has expected h1', async ({ page }) => {
  await clearTestDataBeforeTest();
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});

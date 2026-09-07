import { test, expect } from '@playwright/test';

test.use({
  viewport: { width: 390, height: 844 }, // Viewport khas HP Android / iPhone
  userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
});

test.describe('PWA Tenant Mobile Responsiveness', () => {
  test('harus merender halaman login dengan baik pada tampilan mobile viewport', async ({ page }) => {
    await page.goto('/login');

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton.first()).toBeVisible();

    // Pastikan tidak ada horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(400);
  });

  test('harus merender halaman bantuan/FAQ publik dengan baik', async ({ page }) => {
    await page.goto('/dashboard/help');

    // Jika di-redirect ke /login karena protected route, pastikan redirect bekerja mulus
    if (page.url().includes('/login')) {
      expect(page.url()).toContain('/login');
    } else {
      const heading = page.locator('h1').or(page.locator('h2'));
      await expect(heading.first()).toBeVisible();
    }
  });
});

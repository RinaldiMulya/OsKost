import { test, expect } from '@playwright/test';

// LAUNCH_CHECKLIST 1.B — PWA Tenant Mobile protected routes
const tenantRoutes = [
  '/dashboard',
  '/dashboard/billing',
  '/dashboard/reports',
  '/dashboard/profile',
  '/dashboard/help',
];

test.describe('PWA Tenant — Protected Routes & Mobile (LAUNCH 1.B)', () => {
  for (const route of tenantRoutes) {
    test(`GET ${route} — anonim harus redirect ke /login`, async ({ page }) => {
      await page.goto(route);
      await page.waitForURL(/\/login/, { timeout: 8000 });
      expect(page.url()).toContain('/login');
    });
  }

  test('Mobile viewport 390x844 — login tidak overflow horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/login');
    const submit = page.locator('button[type="submit"]').first();
    await expect(submit).toBeVisible();
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  test('Mobile viewport — /dashboard/help redirect tetap mulus', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard/help');
    await page.waitForURL(/\/login/, { timeout: 8000 });
    expect(page.url()).toContain('/login');
  });

  test('GET /login — viewport mobile tetap render form', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/login');
    await expect(page.locator('input[name="identifier"]').or(page.locator('input[type="text"]')).first()).toBeVisible();
    await expect(page.locator('input[name="password"]').first()).toBeVisible();
  });
});

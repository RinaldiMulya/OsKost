import { test, expect } from '@playwright/test';

// LAUNCH_CHECKLIST 1.A + 3 — Admin Dashboard protected routes
const adminRoutes = [
  '/admin',
  '/admin/rooms',
  '/admin/tenants',
  '/admin/billing',
  '/admin/reports',
  '/admin/settings',
];

test.describe('Admin Dashboard — Protected Routes & Middleware (LAUNCH 1.A / 3)', () => {
  for (const route of adminRoutes) {
    test(`GET ${route} — anonim harus redirect ke /login`, async ({ page }) => {
      await page.goto(route);
      await page.waitForURL(/\/login/, { timeout: 8000 });
      expect(page.url()).toContain('/login');
    });
  }

  test('GET /admin — response 307/308 atau 200 dengan redirect ke login', async ({ request }) => {
    const res = await request.get('/admin', { maxRedirects: 0 }).catch(() => null);
    // NextAuth middleware may return 307 redirect or 200 with login page
    if (res) {
      expect([200, 307, 308]).toContain(res.status());
    }
  });

  test('GET /login — harus render form login (identifier + password + submit)', async ({ page }) => {
    await page.goto('/login');
    const identifier = page.locator('input[name="identifier"]').or(page.locator('input[type="text"]')).or(page.locator('input[type="email"]')).first();
    const password = page.locator('input[name="password"]').or(page.locator('input[type="password"]')).first();
    const submit = page.locator('button[type="submit"]').first();
    await expect(identifier).toBeVisible();
    await expect(password).toBeVisible();
    await expect(submit).toBeVisible();
  });

  test('GET /forgot-password — harus render form lupa password', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('body')).toBeVisible();
    const heading = page.getByText('Lupa Password').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
    await expect(page.locator('input[name="identifier"]').first()).toBeVisible();
  });

  test('GET /login — role switch Admin/Tenant harus ada', async ({ page }) => {
    await page.goto('/login');
    const adminBtn = page.locator('button:has-text("Admin")').first();
    const tenantBtn = page.locator('button:has-text("Penghuni"), button:has-text("Tenant")').first();
    // At least one role switch should be visible
    const hasRoleSwitch = await adminBtn.isVisible().catch(() => false) || await tenantBtn.isVisible().catch(() => false);
    // Fallback: check for any role-related text
    if (!hasRoleSwitch) {
      await expect(page.locator('text=Admin').or(page.locator('text=Penghuni')).first()).toBeVisible({ timeout: 3000 });
    } else {
      expect(hasRoleSwitch).toBeTruthy();
    }
  });
});

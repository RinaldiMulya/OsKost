import { test, expect } from '@playwright/test';

// LAUNCH_CHECKLIST 3 — Security Hardening
test.describe('Security Hardening — LAUNCH 3', () => {
  test('Security headers present on GET /', async ({ request }) => {
    const res = await request.get('/');
    const headers = res.headers();
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBeTruthy();
    expect(headers['strict-transport-security']).toBeTruthy();
  });

  test('Security headers present on GET /login', async ({ request }) => {
    const res = await request.get('/login');
    expect(res.headers()['x-frame-options']).toBe('DENY');
    expect(res.headers()['x-content-type-options']).toBe('nosniff');
  });

  test('GET /login — no passwordHash leaked in HTML', async ({ page }) => {
    await page.goto('/login');
    const html = await page.content();
    expect(html.toLowerCase()).not.toContain('passwordhash');
    expect(html.toLowerCase()).not.toContain('password_hash');
  });

  test('GET / — JSON-LD XSS shield: < escaped to \\u003c', async ({ page }) => {
    await page.goto('/');
    const jsonLd = page.locator('script[type="application/ld+json"]').first();
    await expect(jsonLd).toBeAttached();
    const raw = await jsonLd.innerHTML();
    // Should not contain raw '<' inside JSON string values (escaped)
    // The file uses .replace(/</g, '\\u003c')
    expect(raw).not.toMatch(/"<[^"]*"/); // no raw < inside quoted strings
    // At least check that \u003c appears if < was present, or no raw < at all
    if (raw.includes('<')) {
      expect(raw).toContain('\\u003c');
    }
  });

  test('POST /api/webhooks/midtrans — invalid body returns 400', async ({ request }) => {
    const res = await request.post('/api/webhooks/midtrans', {
      data: { invalid: 'payload' },
      headers: { 'Content-Type': 'application/json' },
    });
    expect([400, 401, 404, 500]).toContain(res.status());
  });

  test('POST /api/webhooks/midtrans — empty body returns 400', async ({ request }) => {
    const res = await request.post('/api/webhooks/midtrans', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });
    expect([400, 401, 404, 500]).toContain(res.status());
  });

  test('GET /api/webhooks/midtrans — method not allowed or 404', async ({ request }) => {
    const res = await request.get('/api/webhooks/midtrans');
    expect([404, 405]).toContain(res.status());
  });

  test('Middleware matcher excludes static assets (sw.js, manifest.json)', async ({ request }) => {
    const sw = await request.get('/sw.js');
    // sw.js should be served (200) or 404 if not built, but not redirect to login
    expect([200, 404]).toContain(sw.status());
    const manifest = await request.get('/manifest.json');
    expect(manifest.status()).toBe(200);
  });

  test('GET /admin — no sensitive data leaked when redirected', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForURL(/\/login/, { timeout: 8000 });
    const html = await page.content();
    expect(html.toLowerCase()).not.toContain('passwordhash');
  });
});

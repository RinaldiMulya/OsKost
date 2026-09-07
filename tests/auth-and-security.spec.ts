import { test, expect } from '@playwright/test';

test.describe('Autentikasi & Keamanan Middleware', () => {
  test('harus merender halaman login dengan input kredensial', async ({ page }) => {
    await page.goto('/login');

    // Verifikasi Form Elements
    const identifierInput = page.locator('input[name="identifier"]').or(page.locator('input[type="text"]')).or(page.locator('input[type="email"]'));
    const passwordInput = page.locator('input[name="password"]').or(page.locator('input[type="password"]'));
    const submitButton = page.locator('button[type="submit"]');

    await expect(identifierInput.first()).toBeVisible();
    await expect(passwordInput.first()).toBeVisible();
    await expect(submitButton.first()).toBeVisible();
  });

  test('harus menampilkan pesan error saat login dengan kredensial salah', async ({ page }) => {
    await page.goto('/login');

    const identifierInput = page.locator('input[name="identifier"]').or(page.locator('input[name="email"]')).or(page.locator('input[type="text"]'));
    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await identifierInput.first().fill('user_salah@example.com');
    await passwordInput.first().fill('passwordsalah123');
    await submitButton.first().click();

    // Verifikasi alert pesan error / sonner toast / text error
    const errorMessage = page.locator('text=salah').or(page.locator('text=gagal')).or(page.locator('text=tidak valid')).or(page.locator('[role="alert"]'));
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  });

  test('Middleware: harus mengalihkan akses anonim dari /admin ke /login', async ({ page }) => {
    await page.goto('/admin');
    
    // Verifikasi redirect otomatis ke /login
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain('/login');
  });

  test('Middleware: harus mengalihkan akses anonim dari /dashboard ke /login', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verifikasi redirect otomatis ke /login
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain('/login');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Landing Page & Public Routes', () => {
  test('harus berhasil merender halaman utama (Landing Page)', async ({ page }) => {
    await page.goto('/');

    // Verifikasi Judul / Hero Section
    await expect(page).toHaveTitle(/OsKost|Smartkost Pulo Jahe/i);
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();

    // Verifikasi Section Katalog Kamar — actual heading is "Available Drops"
    const roomCatalog = page.locator('text=Available Drops').or(page.locator('text=Daftar Kamar')).or(page.locator('text=Kamar Tersedia')).or(page.locator('#rooms'));
    await expect(roomCatalog.first()).toBeVisible({ timeout: 8000 });

    // Verifikasi Section Maps / Lokasi
    const mapsSection = page.locator('text=Lokasi').or(page.locator('text=PETA LOKASI')).or(page.locator('iframe[src*="google.com/maps"]'));
    await expect(mapsSection.first()).toBeVisible();

    // Verifikasi Section FAQ / Bantuan
    const faqSection = page.locator('text=FAQ').or(page.locator('text=Pertanyaan')).or(page.locator('text=Bantuan'));
    await expect(faqSection.first()).toBeVisible();
  });

  test('harus berhasil merender halaman detail kamar publik jika diklik', async ({ page }) => {
    await page.goto('/');
    // Dismiss onboarding tour overlay if present (intercepts clicks on webkit)
    const skipBtn = page.getByRole('button', { name: /Lewati|Skip|Tutup|Close/i }).first();
    if (await skipBtn.isVisible({ timeout: 1500 }).catch(() => false)) await skipBtn.click().catch(() => {});
    await page.keyboard.press('Escape').catch(() => {});

    const detailLink = page.locator('a[href^="/rooms/"]').first();
    if (await detailLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      const href = await detailLink.getAttribute('href');
      if (href) await page.goto(href);
      else await detailLink.click({ force: true });
      await page.waitForURL(/\/rooms\/.+/);
      
      // Verifikasi komponen detail kamar
      const roomHeading = page.locator('h1');
      await expect(roomHeading).toBeVisible();

      // Verifikasi adanya tombol kembali atau WhatsApp CTA
      const backOrCta = page.locator('a[href="/"]').or(page.locator('text=WhatsApp')).or(page.locator('text=Kembali'));
      await expect(backOrCta.first()).toBeVisible();
    }
  });
});

import { test, expect } from "@playwright/test";
import { ADMIN_AUTH_FILE } from "./helpers/auth";

test.describe("06 — Owner Settings & Payment Architecture Audit", () => {
  test.use({ storageState: ADMIN_AUTH_FILE });

  test("Pengaturan (/admin/settings) — Render navigasi tab dan status paket SaaS", async ({
    page,
  }) => {
    await page.goto("/admin/settings", { waitUntil: "networkidle" });

    // 1. Verifikasi Seluruh Tab Pengaturan Tersedia
    await expect(page.locator("button:has-text('Paket Langganan SaaS')")).toBeVisible();
    await expect(page.locator("button:has-text('Metode Pembayaran Sewa')")).toBeVisible();
    await expect(page.locator("button:has-text('Profil Properti Kost')")).toBeVisible();
    await expect(page.locator("button:has-text('Profil & Keamanan')")).toBeVisible();

    // 2. Tab Default: Paket Langganan SaaS
    const planCard = page.locator("text=Paket Aktif").or(page.locator("text=STARTER"));
    await expect(planCard.first()).toBeVisible({ timeout: 8000 });
  });

  test("Tab Metode Pembayaran Sewa — Form Bank & Audit Midtrans Tier Locking / Toggle", async ({
    page,
  }) => {
    await page.goto("/admin/settings", { waitUntil: "networkidle" });

    // Klik Tab Metode Pembayaran Sewa
    const paymentTabBtn = page.locator("button:has-text('Metode Pembayaran Sewa')");
    await paymentTabBtn.click();

    // 1. Verifikasi Form Rekening Bank Pemilik
    const bankSection = page.locator("input[name='bankAccountNumber'], input#bankAccountNumber").first();
    await expect(bankSection).toBeVisible({ timeout: 8000 });

    // 2. Verifikasi Section QRIS Statis
    const qrisSection = page.locator("text=QRIS Statis").or(page.locator("text=Unggah QRIS"));
    await expect(qrisSection.first()).toBeVisible();

    // 3. Verifikasi Section Midtrans Direct Merchant
    const midtransSection = page.locator("h2:has-text('Midtrans')").first();
    await expect(midtransSection).toBeVisible();

    // Verifikasi perlindungan tier atau status toggle
    const tierBadgeOrToggle = page
      .locator("text=Terkunci (Paket Growth+)")
      .or(page.locator("input[name='isMidtransActive']"));
    await expect(tierBadgeOrToggle.first()).toBeVisible();
  });

  test("Tab Profil Properti — Pengaturan Brand & White-labeling Kost", async ({
    page,
  }) => {
    await page.goto("/admin/settings", { waitUntil: "networkidle" });

    // Klik Tab Profil Properti Kost
    const propertyTabBtn = page.locator("button:has-text('Profil Properti Kost')");
    await propertyTabBtn.click();

    // Verifikasi Input Nama Kost & Alamat
    const nameInput = page.locator("input[name='name'], input#propertyName, input[name='propertyName']").first();
    await expect(nameInput).toBeVisible({ timeout: 8000 });
  });

  test("Tab Profil & Keamanan — Form Ganti Password", async ({
    page,
  }) => {
    await page.goto("/admin/settings", { waitUntil: "networkidle" });

    // Klik Tab Profil & Keamanan
    const securityTabBtn = page.locator("button:has-text('Profil & Keamanan')");
    await securityTabBtn.click();

    // Verifikasi form ganti password muncul
    const passwordHeading = page.locator("text=Keamanan & Kata Sandi");
    await expect(passwordHeading.first()).toBeVisible({ timeout: 8000 });

    const passwordField = page.locator("input[type='password']").first();
    await expect(passwordField).toBeVisible();
  });
});

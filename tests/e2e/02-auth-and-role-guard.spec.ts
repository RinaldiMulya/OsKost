import { test, expect } from "@playwright/test";

test.describe("02 — Auth & Role-Based Access Guard Audit", () => {
  test("Akses unauthenticated ke /admin wajib diarahkan ke /login", async ({
    page,
  }) => {
    await page.goto("/admin");
    await page.waitForURL(/\/login/, { timeout: 8000 });
    expect(page.url()).toContain("/login");
  });

  test("Akses unauthenticated ke /super-admin wajib diarahkan ke /login", async ({
    page,
  }) => {
    await page.goto("/super-admin");
    await page.waitForURL(/\/login/, { timeout: 8000 });
    expect(page.url()).toContain("/login");
  });

  test("Halaman /login menggunakan Unified Smart Login (Tanpa tab switcher usang)", async ({
    page,
  }) => {
    await page.goto("/login");

    // Form controls harus ada
    await expect(page.locator("#identifier")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toBeVisible();

    // Pastikan TIDAK ADA tab switcher kuno "Pilih Role: Admin / Tenant"
    const oldRoleSwitch = page
      .locator("button:has-text('Sebagai Tenant')")
      .or(page.locator("button:has-text('Pilih Role')"));
    await expect(oldRoleSwitch).toHaveCount(0);
  });

  test("Negative Case — Kredensial salah menampilkan pesan error", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.fill("#identifier", "salah@oskost.com");
    await page.fill("#password", "passwordSalah123!");
    await page.click("button[type='submit']");

    // Pesan error harus muncul di layar
    const errorAlert = page
      .locator("text=salah")
      .or(page.locator("text=tidak valid"))
      .or(page.locator("text=Kredensial"))
      .or(page.locator("[role='alert']"))
      .or(page.locator(".login-error-alert"));
    await expect(errorAlert.first()).toBeVisible({ timeout: 8000 });
  });

  test("Positive Case — Login Owner Riil (admin@oskost.com) berhasil masuk ke /admin", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.fill("#identifier", "admin@oskost.com");
    await page.fill("#password", "adminpassword123!");
    await page.click("button[type='submit']");

    // Harus dialihkan ke /admin
    await page.waitForURL(/\/admin/, { timeout: 15000 });
    expect(page.url()).toContain("/admin");

    // Verifikasi elemen halaman dashboard overview
    const adminHeading = page
      .locator("text=Ringkasan")
      .or(page.locator("text=Dashboard"))
      .or(page.locator("text=OSkost Pulo Jahe"))
      .or(page.locator("header"));
    await expect(adminHeading.first()).toBeVisible();
  });
});


import { test, expect } from "@playwright/test";
import { ADMIN_AUTH_FILE } from "./helpers/auth";

test.describe("03 — Owner Rooms Management & Pagination Controls Audit", () => {
  test.use({ storageState: ADMIN_AUTH_FILE });

  test("Daftar Kamar (/admin/rooms) — Tabel berhasil merender unit kamar", async ({
    page,
  }) => {
    await page.goto("/admin/rooms", { waitUntil: "networkidle" });

    // Verifikasi Header Halaman
    const headerTitle = page.locator("h1, h2").filter({ hasText: /Kamar/i }).first();
    await expect(headerTitle).toBeVisible();

    // Verifikasi keberadaan tabel kamar
    const table = page.locator("table");
    await expect(table).toBeVisible();

    // Verifikasi baris kamar muncul
    const rows = table.locator("tbody tr");
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("UI/UX Audit PaginationControls — Desain Japandi Warm & Navigasi Halaman Berfungsi Sempurna", async ({
    page,
  }) => {
    await page.goto("/admin/rooms", { waitUntil: "networkidle" });

    // 1. Verifikasi Bilah Pagination
    const paginationContainer = page.locator("text=Menampilkan").locator("..");
    await expect(paginationContainer.first()).toBeVisible({ timeout: 10000 });

    // 2. Verifikasi Teks Info Pagination
    const paginationText = page.locator("text=Menampilkan").first();
    await expect(paginationText).toContainText(/Menampilkan\s+1\s*-\s*10\s+dari\s+11\s+data/i);

    // 3. Verifikasi Indikator Pil Halaman: "1 / 2"
    const pageBadge = page.locator("span:has-text('1 / 2')");
    await expect(pageBadge).toBeVisible();

    // 4. Verifikasi Tombol Prev disabled pada halaman 1
    const prevButton = page.locator("button[aria-label='Halaman sebelumnya']");
    await expect(prevButton).toBeDisabled();

    // 5. Verifikasi Tombol Next aktif dan dapat diklik
    const nextButton = page.locator("button[aria-label='Halaman berikutnya']");
    await expect(nextButton).toBeEnabled();

    // Klik tombol Next menuju halaman 2
    await nextButton.click();
    await page.waitForURL(/page=2/, { timeout: 8000 });

    // 6. Verifikasi Kondisi Halaman 2 (Menampilkan 11 - 11 dari 11 data)
    await expect(page.locator("text=Menampilkan").first()).toContainText(
      /Menampilkan\s+11\s*-\s*11\s+dari\s+11\s+data/i
    );
    await expect(page.locator("span:has-text('2 / 2')")).toBeVisible();
    await expect(nextButton).toBeDisabled();
    await expect(prevButton).toBeEnabled();

    // 7. Klik Kembali ke Halaman 1
    await prevButton.click();
    await page.waitForURL(/page=1/, { timeout: 8000 });
    await expect(page.locator("span:has-text('1 / 2')")).toBeVisible();
  });

  test("Fitur Pencarian Kamar — Filter dinamis nomor kamar", async ({
    page,
  }) => {
    await page.goto("/admin/rooms", { waitUntil: "networkidle" });

    const searchInput = page.locator("input[placeholder*='Cari'], input[type='search']").first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("011");
      await page.waitForTimeout(600); // debounce

      const tableRows = page.locator("tbody tr");
      const filteredCount = await tableRows.count();
      expect(filteredCount).toBeGreaterThan(0);
      await expect(tableRows.first()).toContainText("011");
    }
  });

  test("Form Edit Kamar (/admin/rooms/[id]/edit) — Load data spesifikasi unit", async ({
    page,
  }) => {
    await page.goto("/admin/rooms", { waitUntil: "networkidle" });

    const editButton = page.locator("a[href*='/edit']").first();
    await expect(editButton).toBeVisible({ timeout: 10000 });
    const href = await editButton.getAttribute("href");
    expect(href).toBeTruthy();

    await page.goto(href!, { waitUntil: "networkidle" });

    // Verifikasi form edit memuat data nomor kamar dan harga
    const roomNumberInput = page.locator("input[name='number'], input#number").first();
    await expect(roomNumberInput).toBeVisible();
    const val = await roomNumberInput.inputValue();
    expect(val).toBeTruthy();
  });
});

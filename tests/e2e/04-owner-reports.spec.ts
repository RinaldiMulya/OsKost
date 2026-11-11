import { test, expect } from "@playwright/test";
import { ADMIN_AUTH_FILE } from "./helpers/auth";

test.describe("04 — Owner Reports & Japandi Modal Audit", () => {
  test.use({ storageState: ADMIN_AUTH_FILE });

  test("Daftar Laporan (/admin/reports) — Render halaman, filter status, dan tabel", async ({
    page,
  }) => {
    await page.goto("/admin/reports", { waitUntil: "networkidle" });

    // Verifikasi Judul Halaman
    const headerTitle = page.locator("h1, h2").filter({ hasText: /Laporan Keluhan/i }).first();
    await expect(headerTitle).toBeVisible();

    // Verifikasi Filter Status Pills (Semua, Terbuka, Diproses, Selesai)
    await expect(page.locator("button:has-text('Semua')").first()).toBeVisible();
    await expect(page.locator("button:has-text('Terbuka')").first()).toBeVisible();
    await expect(page.locator("button:has-text('Diproses')").first()).toBeVisible();
    await expect(page.locator("button:has-text('Selesai')").first()).toBeVisible();
  });

  test("Audit UI/UX Modal Detail Laporan — Desain Japandi, Judul Terbaca & Safe Close Button", async ({
    page,
  }) => {
    await page.goto("/admin/reports", { waitUntil: "networkidle" });

    // Cari baris laporan pertama yang ada di tabel
    const reportRow = page.locator("tbody tr").first();
    if (await reportRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Klik baris laporan untuk membuka modal detail
      await reportRow.click();

      // 1. Verifikasi Modal Terbuka
      const dialog = page.locator("[role='dialog']");
      await expect(dialog).toBeVisible({ timeout: 5000 });

      // 2. Verifikasi Header ID & Status Badge
      const idBadge = dialog.locator("text=/ID: #[A-Z0-9]+/i").first();
      await expect(idBadge).toBeVisible();

      // 3. Verifikasi Tombol Tutup (X) Tidak Bertabrakan dengan Badge
      const closeBtn = dialog.locator("[data-slot='dialog-close']").first();
      await expect(closeBtn).toBeVisible();

      const closeBox = await closeBtn.boundingBox();
      const idBox = await idBadge.boundingBox();
      if (closeBox && idBox) {
        // Jarak horizontal tombol X dengan teks header harus terpisah (tidak overlap)
        expect(closeBox.x).toBeGreaterThan(idBox.x + idBox.width - 50);
      }

      // 4. Verifikasi Judul Laporan Terbaca Jelas (bukan teks putih di atas putih)
      const reportTitle = dialog.locator("h3.font-editorial").first();
      await expect(reportTitle).toBeVisible();
      const titleColor = await reportTitle.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });
      // rgb(30, 27, 24) adalah Sumi Charcoal (#1E1B18), tidak boleh rgb(255, 255, 255)
      expect(titleColor).not.toBe("rgb(255, 255, 255)");

      // 5. Verifikasi Deskripsi Masalah & Info Container Menggunakan Card Hangat
      const descBox = dialog.locator("p.bg-muted\\/40, div.bg-muted\\/40").first();
      await expect(descBox).toBeVisible();

      // 6. Verifikasi Tombol Aksi Status
      const actionHeader = dialog.locator("text=Ubah Status");
      await expect(actionHeader).toBeVisible();

      // 7. Tutup Modal
      await closeBtn.click();
      await expect(dialog).toBeHidden();
    }
  });

  test("Form Tambah Laporan Baru — Desain Japandi Light pada input & select", async ({
    page,
  }) => {
    await page.goto("/admin/reports", { waitUntil: "networkidle" });

    const createBtn = page.locator("button:has-text('Tambah Laporan')").first();
    await expect(createBtn).toBeVisible({ timeout: 5000 });
    await createBtn.click();

    // Dialog Tambah Laporan harus muncul
    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();

    // Verifikasi Input Form
    await expect(dialog.locator("select[name='leaseId']")).toBeVisible();
    await expect(dialog.locator("input[name='title']")).toBeVisible();
    await expect(dialog.locator("textarea[name='description']")).toBeVisible();

    // Tutup Modal Form Tambah Laporan
    const cancelBtn = dialog.locator("button:has-text('Batal')").first();
    await cancelBtn.click();
    await expect(dialog).toBeHidden();
  });
});


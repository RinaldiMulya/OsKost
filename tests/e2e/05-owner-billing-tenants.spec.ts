import { test, expect } from "@playwright/test";
import { ADMIN_AUTH_FILE } from "./helpers/auth";

test.describe("05 — Owner Tenants & Billing Management Audit", () => {
  test.use({ storageState: ADMIN_AUTH_FILE });

  test("Manajemen Penghuni (/admin/tenants) — Render bento stats & tenant list", async ({
    page,
  }) => {
    await page.goto("/admin/tenants", { waitUntil: "networkidle" });

    // 1. Verifikasi Header & Tombol Check-in Tenant
    const headerTitle = page.locator("h2").filter({ hasText: /Manajemen Penghuni/i });
    await expect(headerTitle).toBeVisible();

    const checkInBtn = page.locator("a[href*='/admin/tenants/create']").first();
    await expect(checkInBtn).toBeVisible();

    // 2. Verifikasi Kartu Statistik Penghuni
    const statsContainer = page.locator("text=Total Penyewa").or(page.locator("text=Penghuni Aktif"));
    await expect(statsContainer.first()).toBeVisible({ timeout: 8000 });
  });

  test("Form Check-in Tenant Baru (/admin/tenants/create) — Input validation & form structure", async ({
    page,
  }) => {
    await page.goto("/admin/tenants/create", { waitUntil: "networkidle" });

    // Verifikasi Judul Form Check-in
    const formHeading = page.locator("h1, h2").filter({ hasText: /Check-in|Tambah Penghuni/i }).first();
    await expect(formHeading).toBeVisible();

    // Verifikasi field formulir
    const nameInput = page.locator("input[name='fullName'], input#fullName, input[name='name']").first();
    await expect(nameInput).toBeVisible();

    const roomSelect = page.locator("select[name='roomId'], [role='combobox']").first();
    await expect(roomSelect).toBeVisible();
  });

  test("Billing & Keuangan (/admin/billing) — KPI Tagihan, filter status, dan data tabel", async ({
    page,
  }) => {
    await page.goto("/admin/billing", { waitUntil: "networkidle" });

    // 1. Verifikasi Header & Ringkasan Metrik
    const billingHeading = page.locator("h1, h2").filter({ hasText: /Tagihan|Keuangan/i }).first();
    await expect(billingHeading).toBeVisible();

    // 2. Verifikasi Filter Status Tagihan
    const filterAll = page.locator("button:has-text('Semua')").or(page.locator("a:has-text('Semua')"));
    await expect(filterAll.first()).toBeVisible();

    // 3. Verifikasi Tabel Invoice
    const invoiceTable = page.locator("table, .invoice-card").first();
    await expect(invoiceTable).toBeVisible({ timeout: 8000 });
  });
});


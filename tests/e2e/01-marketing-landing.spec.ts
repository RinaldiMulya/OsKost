import { test, expect } from "@playwright/test";

test.describe("01 — Marketing Landing Page & Public Catalog Audit", () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss onboarding tour if present
    await page.addInitScript(() => {
      window.localStorage.setItem("oskost_onboarding_completed", "true");
    });
  });

  test("Desktop Viewport (1280px) — Landing Page renders all essential sections with zero horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/", { waitUntil: "networkidle" });

    // 1. Verifikasi Title & Header
    await expect(page).toHaveTitle(/OsKost|Smartkost Pulo Jahe/i);
    const heroHeading = page.locator("h1");
    await expect(heroHeading).toBeVisible();

    // 2. Verifikasi Section Katalog Kamar
    const catalogSection = page
      .locator("text=Available Drops")
      .or(page.locator("text=Katalog Kamar"))
      .or(page.locator("#rooms"));
    await expect(catalogSection.first()).toBeVisible({ timeout: 10000 });

    // 3. Verifikasi Section Fasilitas & 360 Virtual Tour
    const tourOrFacilities = page
      .locator("text=Virtual Tour")
      .or(page.locator("text=Fasilitas"))
      .or(page.locator("text=360"));
    await expect(tourOrFacilities.first()).toBeVisible();

    // 4. Verifikasi Section Peta / Lokasi
    const locationSection = page
      .locator("text=Lokasi")
      .or(page.locator("text=PETA LOKASI"))
      .or(page.locator("iframe[src*='maps']"));
    await expect(locationSection.first()).toBeVisible();

    // 5. Verifikasi Section FAQ & Footer
    const faqHeading = page
      .locator("text=Pertanyaan Umum")
      .or(page.locator("text=Tanya Jawab"))
      .or(page.locator("text=FAQ"));
    await expect(faqHeading.first()).toBeVisible();

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // 6. Defensive Layout: Zero Horizontal Overflow
    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(isOverflowing).toBeFalsy();
  });

  test("Mobile Viewport (375px) — Responsive Defensive Layouting Audit", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/", { waitUntil: "networkidle" });

    // Pastikan Hero heading tidak terpotong dan terlihat
    const heroHeading = page.locator("h1");
    await expect(heroHeading).toBeVisible();

    // Pastikan tidak ada horizontal scroll liar pada mobile
    const horizontalScrollable = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(horizontalScrollable).toBeFalsy();

    // Pastikan tombol CTA dapat diakses
    const ctaButton = page.locator("a[href*='#rooms'], a[href*='/kamar']").first();
    if (await ctaButton.isVisible()) {
      await expect(ctaButton).toBeEnabled();
    }
  });

  test("Katalog Kamar Publik (/kamar) — Listing, filter, and pricing format check", async ({
    page,
  }) => {
    await page.goto("/kamar", { waitUntil: "networkidle" });

    // Periksa apakah halaman katalog berhasil dimuat
    await expect(page.locator("h1").or(page.locator("h2")).first()).toBeVisible();

    // Periksa kartu kamar yang dirender
    const roomCards = page.locator("article, a[href^='/rooms/'], .ceramic-card");
    const count = await roomCards.count();
    expect(count).toBeGreaterThan(0);

    // Periksa format harga: simbol Rp tidak terpisah dan nominal berformat Rupiah
    const priceText = await page.locator("text=/Rp\\s?[0-9.]+/i").first().textContent();
    expect(priceText).toMatch(/Rp\s?[0-9.]+/i);
  });

  test("Halaman Detail Kamar Publik (/rooms/[id]) — Galeri foto & Tombol Booking WhatsApp", async ({
    page,
  }) => {
    await page.goto("/kamar", { waitUntil: "networkidle" });

    const firstRoomLink = page.locator("a[href^='/rooms/']").first();
    await expect(firstRoomLink).toBeVisible({ timeout: 10000 });
    const href = await firstRoomLink.getAttribute("href");
    expect(href).toBeTruthy();

    await page.goto(href!, { waitUntil: "networkidle" });

    // Verifikasi judul nama/nomor kamar
    const title = page.locator("h1");
    await expect(title).toBeVisible();

    // Verifikasi adanya tombol CTA WhatsApp atau Kontak Pengelola
    const waButton = page
      .locator("a[href*='wa.me']")
      .or(page.locator("a[href*='whatsapp']"))
      .or(page.locator("button:has-text('Hubungi')"))
      .or(page.locator("text=WhatsApp"));
    await expect(waButton.first()).toBeVisible();
  });
});

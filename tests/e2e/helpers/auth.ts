import { Page } from "@playwright/test";
import fs from "fs";
import path from "path";

export const ADMIN_AUTH_FILE = path.resolve(
  __dirname,
  "../../../playwright/.auth/admin.json"
);

export async function loginAsOwner(page: Page) {
  // Check if session is already active in current page
  if (page.url().includes("/admin")) {
    return;
  }

  // If saved storage state exists, try accessing /admin first
  if (fs.existsSync(ADMIN_AUTH_FILE)) {
    try {
      await page.goto("/admin", { waitUntil: "domcontentloaded" });
      if (page.url().includes("/admin") && !page.url().includes("/login")) {
        return; // Session is valid!
      }
    } catch {
      // Proceed to login below
    }
  }

  // Perform full login
  await page.goto("/login");
  await page.fill("#identifier", "admin@oskost.com");
  await page.fill("#password", "adminpassword123!");
  await page.click("button[type='submit']");
  await page.waitForURL(/\/admin/, { timeout: 15000 });

  // Save cookies & storage state for subsequent tests
  const dir = path.dirname(ADMIN_AUTH_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  await page.context().storageState({ path: ADMIN_AUTH_FILE });
}


import { test as setup, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

const authFile = path.resolve(__dirname, "../playwright/.auth/admin.json");

setup("authenticate as owner", async ({ page }) => {
  const dir = path.dirname(authFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  await page.goto("/login");
  await page.fill("#identifier", "admin@oskost.com");
  await page.fill("#password", "adminpassword123!");
  await page.click("button[type='submit']");
  await page.waitForURL(/\/admin/, { timeout: 15000 });
  await expect(page).toHaveURL(/\/admin/);

  await page.context().storageState({ path: authFile });
});

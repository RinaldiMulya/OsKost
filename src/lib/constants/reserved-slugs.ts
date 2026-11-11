/**
 * Daftar kata cadangan (Reserved Slugs) untuk subdomain dan rute sistem OsKost.
 * Mencegah tabrakan antara subdomain sistem (app, api, super-admin, dll.) dengan slug kost pemilik.
 */
export const RESERVED_SLUGS = new Set([
  // Core Platform Subdomains
  "app",
  "api",
  "admin",
  "super-admin",
  "superadmin",
  "oskost",
  "dashboard",
  "portal",
  "hq",
  "control",

  // Auth & Account Endpoints
  "login",
  "signin",
  "register",
  "signup",
  "auth",
  "logout",
  "signout",
  "forgot-password",
  "reset-password",
  "verify",

  // System Infrastructure & Mail
  "mail",
  "email",
  "smtp",
  "imap",
  "pop",
  "ftp",
  "cpanel",
  "whm",
  "ns1",
  "ns2",
  "dns",
  "mx",
  "dev",
  "development",
  "staging",
  "test",
  "testing",
  "demo",
  "sandbox",
  "status",
  "health",
  "ping",
  "uptime",

  // Assets & Static Distribution
  "assets",
  "static",
  "cdn",
  "media",
  "images",
  "img",
  "files",
  "uploads",
  "public",

  // Information, Docs & Support
  "docs",
  "documentation",
  "help",
  "support",
  "faq",
  "contact",
  "terms",
  "privacy",
  "legal",
  "about",
  "blog",
  "news",

  // Business & Financial Operations
  "billing",
  "payment",
  "checkout",
  "invoice",
  "invoices",
  "pricing",
  "plans",
  "subscription",
  "subscriptions",
  "webhook",
  "webhooks",
  "midtrans",
  "xendit",

  // Standard Web Conventions
  "www",
  "root",
  "null",
  "undefined",
  "localhost",
]);

/**
 * Validasi apakah sebuah slug termasuk kata cadangan sistem
 */
export function isReservedSlug(slug: string): boolean {
  if (!slug) return true;
  const normalized = slug.toLowerCase().trim();
  return RESERVED_SLUGS.has(normalized);
}

/**
 * Validasi format slug: hanya huruf kecil, angka, dan tanda hubung (-)
 */
export function isValidSlugFormat(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug.toLowerCase().trim());
}

/**
 * Validasi lengkap slug properti
 */
export function validatePropertySlug(slug: string): {
  valid: boolean;
  error?: string;
} {
  const clean = slug.toLowerCase().trim();

  if (!clean || clean.length < 3) {
    return { valid: false, error: "Slug URL minimal terdiri dari 3 karakter." };
  }

  if (clean.length > 50) {
    return {
      valid: false,
      error: "Slug URL maksimal terdiri dari 50 karakter.",
    };
  }

  if (!isValidSlugFormat(clean)) {
    return {
      valid: false,
      error:
        "Slug URL hanya boleh menggunakan huruf kecil, angka, dan tanda hubung (-).",
    };
  }

  if (isReservedSlug(clean)) {
    return {
      valid: false,
      error: `Slug "${clean}" adalah kata cadangan sistem dan tidak dapat digunakan.`,
    };
  }

  return { valid: true };
}

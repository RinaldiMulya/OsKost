/**
 * Centralized Cache Tag Definitions
 * ===================================
 * Semua cache tags didefinisikan di sini sebagai single source of truth.
 *
 * Pola:
 * - Static tags → UPPER_CASE constants (e.g. DASHBOARD_STATS)
 * - Dynamic/parameterized tags → camelCase functions (e.g. tenantData(userId))
 *
 * Setiap kali ada mutation (Server Action), panggil updateTag()
 * dengan tag yang relevan untuk invalidate cache.
 */

export const CACHE_TAGS = {
  // ─── Dashboard ────────────────────────────────
  DASHBOARD_STATS: "dashboard-stats",

  // ─── Admin: Tenants ───────────────────────────
  ADMIN_TENANTS: "admin-tenants",
  adminTenantDetail: (id: string) => `admin-tenant-${id}` as const,

  // ─── Admin: Rooms ─────────────────────────────
  ADMIN_ROOMS: "admin-rooms",
  ADMIN_ROOM_STATS: "admin-room-stats",

  // ─── Reports ──────────────────────────────────
  REPORTS_ALL: "reports-all",
  REPORTS_BY_STATUS: (status: string) => `reports-${status}` as const,
  REPORT_BY_ID: (id: string) => `report-${id}` as const,

  // ─── Tenant PWA (per-user) ────────────────────
  tenantDashboard: (userId: string) => `tenant-dashboard-${userId}` as const,
  tenantInvoices: (userId: string) => `tenant-invoices-${userId}` as const,
  tenantReports: (userId: string) => `tenant-reports-${userId}` as const,
  userNotifications: (userId: string) => `user-notifications-${userId}` as const,

  // ─── Landing / Marketing ──────────────────────
  ROOMS_LANDING: "rooms-landing",
  roomDetail: (id: string) => `room-${id}` as const,
} as const;

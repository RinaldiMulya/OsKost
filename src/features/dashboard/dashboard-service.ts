import "server-only";
import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";

export interface DashboardStats {
  totalRooms: number;
  occupied: number;
  available: number;
  maintenance: number;
  totalTenants: number;
  unpaidInvoices: number;
  openReports: number;
  occupancyRate: number;
}

export interface RecentActivity {
  id: string;
  type: "PAYMENT" | "NEW_TENANT" | "REPORT";
  title: string;
  description: string;
  date: Date;
  status: string;
}

export interface ExpiringLease {
  id: string;
  tenantName: string;
  roomNumber: string;
  endDate: Date;
  daysRemaining: number;
}

export async function getDashboardStats(propertyId?: string): Promise<DashboardStats> {
  const scope = propertyId ? { propertyId } : {};
  return unstable_cache(
    async () => {
      const [roomStatusGroups, totalTenants, unpaidInvoices, openReports] =
        await Promise.all([
          prisma.room.groupBy({
            by: ["status"],
            where: scope,
            _count: { status: true },
          }),
          // Hitung hanya penyewa yang memiliki lease aktif
          prisma.user.count({
            where: {
              role: "TENANT",
              leases: { some: { isActive: true, ...scope } },
            },
          }),
          prisma.invoice.count({
            where: {
              status: { in: ["UNPAID", "OVERDUE"] },
              ...scope,
            },
          }),
          prisma.report.count({
            where: { status: "OPEN", ...scope },
          }),
        ]);

      const statusMap = Object.fromEntries(
        roomStatusGroups.map((g) => [g.status, g._count.status]),
      );

      const totalRooms =
        (statusMap["AVAILABLE"] ?? 0) +
        (statusMap["OCCUPIED"] ?? 0) +
        (statusMap["MAINTENANCE"] ?? 0);
      const occupied = statusMap["OCCUPIED"] ?? 0;
      const occupancyRate =
        totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;

      return {
        totalRooms,
        occupied,
        available: statusMap["AVAILABLE"] ?? 0,
        maintenance: statusMap["MAINTENANCE"] ?? 0,
        totalTenants,
        unpaidInvoices,
        openReports,
        occupancyRate,
      };
    },
    [`dashboard-stats-${propertyId || "all"}`],
    { tags: [CACHE_TAGS.DASHBOARD_STATS], revalidate: 15 },
  )();
}

export async function getRecentActivities(propertyId?: string): Promise<RecentActivity[]> {
  const scope = propertyId ? { propertyId } : {};
  return unstable_cache(
    async () => {
      // Batas waktu: 3 hari terakhir
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      // Ambil pembayaran 3 hari terakhir
      const recentPayments = await prisma.invoice.findMany({
        where: {
          status: { in: ["PAID", "PENDING"] },
          paidAt: { not: null, gte: threeDaysAgo },
          ...scope,
        },
        orderBy: { paidAt: "desc" },
        take: 20,
        include: {
          lease: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  phoneNumber: true,
                  role: true,
                  createdAt: true,
                  tenantProfile: true,
                },
              },
              room: true,
            },
          },
        },
      });

      // Ambil tenant baru 3 hari terakhir
      const recentLeases = await prisma.lease.findMany({
        where: {
          startDate: { gte: threeDaysAgo },
          ...scope,
        },
        orderBy: { startDate: "desc" },
        take: 20,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phoneNumber: true,
              role: true,
              createdAt: true,
              tenantProfile: true,
            },
          },
          room: true,
        },
      });

      // Ambil laporan 3 hari terakhir
      const recentReports = await prisma.report.findMany({
        where: {
          createdAt: { gte: threeDaysAgo },
          ...scope,
        },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          lease: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  phoneNumber: true,
                  role: true,
                  createdAt: true,
                  tenantProfile: true,
                },
              },
              room: true,
            },
          },
        },
      });

      const activities: RecentActivity[] = [];

      recentPayments.forEach((inv) => {
        activities.push({
          id: inv.id,
          type: "PAYMENT",
          title: "Pembayaran Tagihan",
          description: `${inv.lease.user.tenantProfile?.fullName ?? "Penghuni"} (Kamar ${inv.lease.room.number})`,
          date: inv.paidAt || inv.createdAt,
          status: inv.status,
        });
      });

      recentLeases.forEach((lease) => {
        activities.push({
          id: lease.id,
          type: "NEW_TENANT",
          title: "Check-in Penghuni",
          description: `${lease.user.tenantProfile?.fullName ?? "Penghuni"} (Kamar ${lease.room.number})`,
          date: lease.startDate,
          status: lease.isActive ? "ACTIVE" : "INACTIVE",
        });
      });

      recentReports.forEach((rep) => {
        activities.push({
          id: rep.id,
          type: "REPORT",
          title: rep.title,
          description: `${rep.lease.user.tenantProfile?.fullName ?? "Penghuni"} (Kamar ${rep.lease.room.number})`,
          date: rep.createdAt,
          status: rep.status,
        });
      });

      // Sort by date desc — tampilkan semua aktivitas 3 hari terakhir
      activities.sort((a, b) => b.date.getTime() - a.date.getTime());
      return activities;
    },
    [`dashboard-recent-activities-${propertyId || "all"}`],
    {
      tags: [
        CACHE_TAGS.DASHBOARD_STATS,
        CACHE_TAGS.ADMIN_TENANTS,
        CACHE_TAGS.REPORTS_ALL,
      ],
    },
  )();
}

export async function getExpiringLeases(propertyId?: string): Promise<ExpiringLease[]> {
  const scope = propertyId ? { propertyId } : {};
  return unstable_cache(
    async () => {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const leases = await prisma.lease.findMany({
        where: {
          isActive: true,
          endDate: {
            not: null,
            lte: thirtyDaysFromNow,
          },
          ...scope,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phoneNumber: true,
              role: true,
              createdAt: true,
              tenantProfile: true,
            },
          },
          room: true,
        },
        orderBy: { endDate: "asc" },
        take: 10,
      });

      const now = new Date().getTime();
      return leases.map((lease) => {
        const endDate = lease.endDate!;
        const diffDays = Math.ceil(
          (endDate.getTime() - now) / (1000 * 60 * 60 * 24),
        );

        return {
          id: lease.id,
          tenantName: lease.user.tenantProfile?.fullName ?? "Penghuni",
          roomNumber: lease.room.number,
          endDate: endDate,
          daysRemaining: diffDays > 0 ? diffDays : 0,
        };
      });
    },
    [`dashboard-expiring-leases-${propertyId || "all"}`],
    { tags: [CACHE_TAGS.DASHBOARD_STATS, CACHE_TAGS.ADMIN_TENANTS] },
  )();
}

// ============================================
// Chart Data Types & Queries
// ============================================

export interface RevenueChartItem {
  month: string; // format: "Jan", "Feb", etc.
  amount: number; // total pendapatan (dalam Rupiah)
}

export interface OccupancyChartItem {
  status: string; // "Terisi" | "Kosong" | "Maintenance"
  count: number;
  fill: string;
}

export interface PaymentStatusChartItem {
  status: string; // "Lunas" | "Menunggu" | "Belum Bayar" | "Overdue"
  count: number;
  fill: string;
}

export interface MaintenanceChartItem {
  month: string;
  open: number;
  inProgress: number;
  resolved: number;
}

// ─── Revenue Chart (6 bulan terakhir) ──────────────────

export async function getRevenueChartData(propertyId?: string): Promise<RevenueChartItem[]> {
  const scope = propertyId ? { propertyId } : {};
  return unstable_cache(
    async (): Promise<RevenueChartItem[]> => {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      const paidInvoices = await prisma.invoice.findMany({
        where: {
          status: "PAID",
          paidAt: { gte: sixMonthsAgo },
          ...scope,
        },
        select: {
          amount: true,
          paidAt: true,
        },
      });

      // Kelompokkan per bulan
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];

      const monthlyMap = new Map<string, number>();

      // Inisialisasi 6 bulan terakhir dengan nilai 0
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        monthlyMap.set(key, 0);
      }

      // Akumulasi amount
      for (const inv of paidInvoices) {
        if (!inv.paidAt) continue;
        const d = inv.paidAt;
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        if (monthlyMap.has(key)) {
          monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + inv.amount);
        }
      }

      return Array.from(monthlyMap.entries()).map(([month, amount]) => ({
        month,
        amount,
      }));
    },
    [`dashboard-revenue-chart-${propertyId || "all"}`],
    { tags: [CACHE_TAGS.DASHBOARD_STATS] },
  )();
}

// ─── Occupancy Chart ────────────────────────────────────

export async function getOccupancyChartData(propertyId?: string): Promise<OccupancyChartItem[]> {
  const scope = propertyId ? { propertyId } : {};
  return unstable_cache(
    async (): Promise<OccupancyChartItem[]> => {
      const groups = await prisma.room.groupBy({
        by: ["status"],
        where: scope,
        _count: { status: true },
      });

      const statusMap: Record<string, { label: string; fill: string }> = {
        OCCUPIED: { label: "Terisi", fill: "var(--chart-1)" },
        AVAILABLE: { label: "Kosong", fill: "var(--chart-2)" },
        MAINTENANCE: { label: "Maintenance", fill: "var(--chart-3)" },
      };

      return groups.map((g) => ({
        status: statusMap[g.status]?.label ?? g.status,
        count: g._count.status,
        fill: statusMap[g.status]?.fill ?? "var(--chart-4)",
      }));
    },
    [`dashboard-occupancy-chart-${propertyId || "all"}`],
    { tags: [CACHE_TAGS.DASHBOARD_STATS, CACHE_TAGS.ADMIN_ROOMS] },
  )();
}

// ─── Payment Status Chart (bulan berjalan) ──────────────

export async function getPaymentStatusChartData(propertyId?: string): Promise<PaymentStatusChartItem[]> {
  const scope = propertyId ? { propertyId } : {};
  return unstable_cache(
    async (): Promise<PaymentStatusChartItem[]> => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
      );

      const groups = await prisma.invoice.groupBy({
        by: ["status"],
        where: {
          dueDate: { gte: startOfMonth, lte: endOfMonth },
          ...scope,
        },
        _count: { status: true },
      });

      const statusMap: Record<string, { label: string; fill: string }> = {
        PAID: { label: "Lunas", fill: "var(--chart-1)" },
        PENDING: { label: "Menunggu", fill: "var(--chart-4)" },
        UNPAID: { label: "Belum Bayar", fill: "var(--chart-2)" },
        OVERDUE: { label: "Overdue", fill: "var(--chart-5)" },
        CANCELLED: { label: "Dibatalkan", fill: "var(--chart-3)" },
      };

      return groups.map((g) => ({
        status: statusMap[g.status]?.label ?? g.status,
        count: g._count.status,
        fill: statusMap[g.status]?.fill ?? "var(--chart-4)",
      }));
    },
    [`dashboard-payment-status-chart-${propertyId || "all"}`],
    { tags: [CACHE_TAGS.DASHBOARD_STATS] },
  )();
}

// ─── Maintenance Chart (6 bulan terakhir, per status) ───

export async function getMaintenanceChartData(propertyId?: string): Promise<MaintenanceChartItem[]> {
  const scope = propertyId ? { propertyId } : {};
  return unstable_cache(
    async (): Promise<MaintenanceChartItem[]> => {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      const reports = await prisma.report.findMany({
        where: {
          createdAt: { gte: sixMonthsAgo },
          ...scope,
        },
        select: {
          status: true,
          createdAt: true,
        },
      });

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];

      // Inisialisasi 6 bulan terakhir
      const monthlyMap = new Map<string, MaintenanceChartItem>();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        monthlyMap.set(key, { month: key, open: 0, inProgress: 0, resolved: 0 });
      }

      // Akumulasi data
      for (const rep of reports) {
        const d = rep.createdAt;
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        const entry = monthlyMap.get(key);
        if (!entry) continue;

        if (rep.status === "OPEN") entry.open++;
        else if (rep.status === "IN_PROGRESS") entry.inProgress++;
        else if (rep.status === "RESOLVED") entry.resolved++;
      }

      return Array.from(monthlyMap.values());
    },
    [`dashboard-maintenance-chart-${propertyId || "all"}`],
    { tags: [CACHE_TAGS.DASHBOARD_STATS, CACHE_TAGS.REPORTS_ALL] },
  )();
}

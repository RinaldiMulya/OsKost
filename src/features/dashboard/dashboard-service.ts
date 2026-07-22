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

const getDashboardStatsQuery = unstable_cache(
  async () => {
    const [roomStatusGroups, totalTenants, unpaidInvoices, openReports] =
      await Promise.all([
        prisma.room.groupBy({
          by: ["status"],
          _count: { status: true },
        }),
        // Hitung hanya penyewa yang memiliki lease aktif
        prisma.user.count({
          where: {
            role: "TENANT",
            leases: { some: { isActive: true } },
          },
        }),
        prisma.invoice.count({
          where: {
            status: { in: ["UNPAID", "OVERDUE"] },
          },
        }),
        prisma.report.count({
          where: { status: "OPEN" },
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
  ["dashboard-stats"],
  { tags: [CACHE_TAGS.DASHBOARD_STATS] },
);

export async function getDashboardStats(): Promise<DashboardStats> {
  return getDashboardStatsQuery();
}

const getRecentActivitiesQuery = unstable_cache(
  async () => {
    // Ambil 5 pembayaran terbaru
    const recentPayments = await prisma.invoice.findMany({
      where: { status: { in: ["PAID", "PENDING"] }, paidAt: { not: null } },
      orderBy: { paidAt: "desc" },
      take: 5,
      include: {
        lease: {
          include: { user: { include: { tenantProfile: true } }, room: true },
        },
      },
    });

    // Ambil 5 tenant baru
    const recentLeases = await prisma.lease.findMany({
      orderBy: { startDate: "desc" },
      take: 5,
      include: { user: { include: { tenantProfile: true } }, room: true },
    });

    // Ambil 5 laporan terbaru
    const recentReports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        lease: {
          include: { user: { include: { tenantProfile: true } }, room: true },
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

    // Sort by date desc and take top 5
    activities.sort((a, b) => b.date.getTime() - a.date.getTime());
    return activities.slice(0, 5);
  },
  ["dashboard-recent-activities"],
  {
    tags: [
      CACHE_TAGS.DASHBOARD_STATS,
      CACHE_TAGS.ADMIN_TENANTS,
      CACHE_TAGS.tenantReports("*"),
      CACHE_TAGS.tenantInvoices("*"),
    ],
  },
);

export async function getRecentActivities(): Promise<RecentActivity[]> {
  return getRecentActivitiesQuery();
}

const getExpiringLeasesQuery = unstable_cache(
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
      },
      include: { user: { include: { tenantProfile: true } }, room: true },
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
  ["dashboard-expiring-leases"],
  { tags: [CACHE_TAGS.DASHBOARD_STATS, CACHE_TAGS.ADMIN_TENANTS] },
);

export async function getExpiringLeases(): Promise<ExpiringLease[]> {
  return getExpiringLeasesQuery();
}

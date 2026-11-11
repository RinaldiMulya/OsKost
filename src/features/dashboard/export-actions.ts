"use server";

import { requireOwnerSession } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

/**
 * Server Action: Export data dashboard admin ke format yang siap CSV.
 * Mengambil data stats, aktivitas terbaru (3 hari), dan kamar habis kontrak.
 */
export async function exportDashboardDataAction() {
  const user = await requireOwnerSession();
  const propertyId = user.propertyId;

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  // Fetch semua data secara parallel
  const [
    roomStatusGroups,
    totalTenants,
    unpaidInvoices,
    openReports,
    recentPayments,
    recentLeases,
    recentReports,
    expiringLeases,
  ] = await Promise.all([
    prisma.room.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.user.count({
      where: { role: "TENANT", leases: { some: { isActive: true } } },
    }),
    prisma.invoice.count({
      where: { status: { in: ["UNPAID", "OVERDUE"] } },
    }),
    prisma.report.count({ where: { status: "OPEN" } }),
    // Pembayaran 3 hari terakhir
    prisma.invoice.findMany({
      where: {
        status: { in: ["PAID", "PENDING"] },
        paidAt: { not: null, gte: threeDaysAgo },
      },
      orderBy: { paidAt: "desc" },
      take: 50,
      select: {
        id: true,
        amount: true,
        status: true,
        paidAt: true,
        dueDate: true,
        lease: {
          select: {
            user: { select: { tenantProfile: { select: { fullName: true } } } },
            room: { select: { number: true } },
          },
        },
      },
    }),
    // Check-in 3 hari terakhir
    prisma.lease.findMany({
      where: { startDate: { gte: threeDaysAgo } },
      orderBy: { startDate: "desc" },
      take: 50,
      select: {
        id: true,
        startDate: true,
        user: { select: { tenantProfile: { select: { fullName: true } } } },
        room: { select: { number: true } },
      },
    }),
    // Laporan 3 hari terakhir
    prisma.report.findMany({
      where: { createdAt: { gte: threeDaysAgo } },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        lease: {
          select: {
            user: { select: { tenantProfile: { select: { fullName: true } } } },
            room: { select: { number: true } },
          },
        },
      },
    }),
    // Kamar habis kontrak < 30 hari
    prisma.lease.findMany({
      where: {
        isActive: true,
        endDate: { lte: thirtyDaysFromNow, gte: new Date() },
      },
      orderBy: { endDate: "asc" },
      select: {
        id: true,
        endDate: true,
        user: { select: { tenantProfile: { select: { fullName: true } } } },
        room: { select: { number: true } },
      },
    }),
  ]);

  // Konversi data stats
  const statusMap = Object.fromEntries(
    roomStatusGroups.map((g) => [g.status, g._count.status])
  );
  const totalRooms =
    (statusMap["AVAILABLE"] ?? 0) +
    (statusMap["OCCUPIED"] ?? 0) +
    (statusMap["MAINTENANCE"] ?? 0);
  const occupied = statusMap["OCCUPIED"] ?? 0;
  const occupancyRate =
    totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;

  return {
    stats: {
      totalRooms,
      occupied,
      available: statusMap["AVAILABLE"] ?? 0,
      maintenance: statusMap["MAINTENANCE"] ?? 0,
      totalTenants,
      unpaidInvoices,
      openReports,
      occupancyRate,
    },
    recentPayments: recentPayments.map((p) => ({
      nama: p.lease.user.tenantProfile?.fullName ?? "-",
      kamar: p.lease.room.number,
      amount: p.amount,
      status: p.status,
      paidAt: p.paidAt?.toISOString() ?? null,
      dueDate: p.dueDate.toISOString(),
    })),
    recentCheckIns: recentLeases.map((l) => ({
      nama: l.user.tenantProfile?.fullName ?? "-",
      kamar: l.room.number,
      startDate: l.startDate.toISOString(),
    })),
    recentReports: recentReports.map((r) => ({
      judul: r.title,
      nama: r.lease.user.tenantProfile?.fullName ?? "-",
      kamar: r.lease.room.number,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    })),
    expiringLeases: expiringLeases.map((l) => ({
      nama: l.user.tenantProfile?.fullName ?? "-",
      kamar: l.room.number,
      endDate: l.endDate?.toISOString() ?? "-",
      daysRemaining: l.endDate
        ? Math.ceil(
            (new Date(l.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
        : 0,
    })),
  };
}

/**
 * Server Action: Export data seluruh penghuni untuk admin.
 */
export async function exportTenantsDataAction() {
  const user = await requireOwnerSession();
  const propertyId = user.propertyId;

  const tenants = await prisma.user.findMany({
    where: {
      role: "TENANT",
      leases: {
        some: {
          isActive: true,
          ...(propertyId ? { propertyId } : {}),
        },
      },
    },
    select: {
      id: true,
      email: true,
      phoneNumber: true,
      createdAt: true,
      tenantProfile: {
        select: {
          fullName: true,
          ktpNumber: true,
          address: true,
          emergencyContactName: true,
          emergencyContactNumber: true,
        },
      },
      leases: {
        orderBy: { startDate: "desc" },
        take: 1,
        select: {
          isActive: true,
          startDate: true,
          endDate: true,
          room: {
            select: {
              number: true,
              name: true,
              price: true,
              property: { select: { name: true } },
            },
          },
          invoices: {
            where: { status: { in: ["UNPAID", "OVERDUE"] } },
            select: { id: true },
          },
        },
      },
    },
  });

  return tenants.map((t) => {
    const activeLease = t.leases[0];
    return {
      nama: t.tenantProfile?.fullName ?? "-",
      email: t.email ?? "-",
      noHP: t.phoneNumber ?? "-",
      noKTP: t.tenantProfile?.ktpNumber ?? "-",
      alamatKTP: t.tenantProfile?.address ?? "-",
      kontakDarurat: t.tenantProfile?.emergencyContactName ?? "-",
      noKontakDarurat: t.tenantProfile?.emergencyContactNumber ?? "-",
      kamar: activeLease?.room.number ?? "-",
      namaKamar: activeLease?.room.name ?? "-",
      properti: activeLease?.room.property.name ?? "-",
      hargaSewa: activeLease?.room.price ?? 0,
      statusKontrak: activeLease?.isActive ? "Aktif" : "Tidak Aktif",
      mulaiKontrak: activeLease?.startDate?.toISOString() ?? "-",
      akhirKontrak: activeLease?.endDate?.toISOString() ?? "-",
      tunggakan: activeLease?.invoices.length ?? 0,
      terdaftarSejak: t.createdAt.toISOString(),
    };
  });
}

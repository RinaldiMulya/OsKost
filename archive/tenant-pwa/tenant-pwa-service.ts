import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { z } from "zod";
import bcryptjs from "bcryptjs";
import { CACHE_TAGS } from "@/lib/cache-tags";
import logger from "@/lib/logger";

const log = logger.child({ module: "tenant-pwa-service" });

// ============================================
// Schemas
// ============================================

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6, "Password minimal 6 karakter"),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
});

export const reportSubmitSchema = z.object({
  title: z.string().min(1, "Judul laporan wajib diisi"),
  description: z.string().min(5, "Deskripsi laporan minimal 5 karakter"),
  photoUrl: z.string().optional().or(z.literal("")),
});

// ============================================
// Service Queries (Cached)
// ============================================

/**
 * Fetch tenant, active lease, room details, and current/pending bill.
 *
 * Optimization layers:
 * 1. React.cache() → deduplicate within a single request (layout + page)
 * 2. unstable_cache() → cache across requests, invalidated via tags
 */
export const getTenantDashboardData = cache(async (userId: string) => {
  return unstable_cache(
    async () => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          phoneNumber: true,
          role: true,
          createdAt: true,
          tenantProfile: true,
        },
      });

      if (!user) return null;

      // Find active lease
      const activeLease = await prisma.lease.findFirst({
        where: { userId, isActive: true },
        include: {
          room: {
            include: {
              property: true,
            },
          },
        },
      });

      let currentInvoice = null;

      if (activeLease) {
        // Find the oldest unpaid/pending invoice, or the latest invoice
        currentInvoice = await prisma.invoice.findFirst({
          where: {
            leaseId: activeLease.id,
            status: { in: ["UNPAID", "PENDING", "OVERDUE"] },
          },
          orderBy: { dueDate: "asc" },
        });

        // If no unpaid invoices, get the latest overall invoice
        if (!currentInvoice) {
          currentInvoice = await prisma.invoice.findFirst({
            where: { leaseId: activeLease.id },
            orderBy: { dueDate: "desc" },
          });
        }
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          phoneNumber: user.phoneNumber,
          fullName: user.tenantProfile?.fullName || "Penghuni Kost",
          address: user.tenantProfile?.address,
          ktpNumber: user.tenantProfile?.ktpNumber,
          emergencyContactName: user.tenantProfile?.emergencyContactName,
          emergencyContactNumber: user.tenantProfile?.emergencyContactNumber,
        },
        activeLease: activeLease ? {
          id: activeLease.id,
          startDate: activeLease.startDate,
          endDate: activeLease.endDate,
          isActive: activeLease.isActive,
          room: {
            id: activeLease.room.id,
            number: activeLease.room.number,
            name: activeLease.room.name,
            price: activeLease.room.price,
            facilities: activeLease.room.facilities,
            propertyName: activeLease.room.property.name,
            propertyAddress: activeLease.room.property.address,
          },
        } : null,
        currentInvoice,
      };
    },
    [`tenant-dashboard-${userId}`],
    { tags: [CACHE_TAGS.tenantDashboard(userId)], revalidate: 60 }
  )();
});

/**
 * Fetch all invoices for a tenant (active and past leases).
 */
export const getTenantInvoices = cache(async (userId: string) => {
  return unstable_cache(
    async () => {
      const leases = await prisma.lease.findMany({
        where: { userId },
        select: { id: true },
      });

      const leaseIds = leases.map((l) => l.id);

      if (leaseIds.length === 0) return [];

      return prisma.invoice.findMany({
        where: {
          leaseId: { in: leaseIds },
        },
        orderBy: { dueDate: "desc" },
      });
    },
    [`tenant-invoices-${userId}`],
    { tags: [CACHE_TAGS.tenantInvoices(userId)] }
  )();
});

/**
 * Fetch all maintenance reports submitted by a tenant.
 */
export const getTenantReports = cache(async (userId: string) => {
  return unstable_cache(
    async () => {
      const leases = await prisma.lease.findMany({
        where: { userId },
        select: { id: true },
      });

      const leaseIds = leases.map((l) => l.id);

      if (leaseIds.length === 0) return [];

      return prisma.report.findMany({
        where: {
          leaseId: { in: leaseIds },
        },
        orderBy: { createdAt: "desc" },
      });
    },
    [`tenant-reports-${userId}`],
    { tags: [CACHE_TAGS.tenantReports(userId)] }
  )();
});

// ============================================
// Service Mutations (No cache — these write data)
// ============================================

/**
 * Update invoice status and set proof of payment URL.
 */
export async function uploadPaymentProof(invoiceId: string, proofUrl: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) {
    throw new Error("Invoice tidak ditemukan");
  }

  return prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      proofUrl,
      status: "PENDING", // Pending Admin confirmation
      paidAt: new Date(),
      adminNote: null, // Bersihkan pesan penolakan sebelumnya jika ada
    },
  });
}

import { sendNotification } from "@/features/notifications/notification-service";

/**
 * Create a new maintenance report linked to the tenant's active lease.
 */
export async function createMaintenanceReport(
  userId: string,
  title: string,
  description: string,
  photoUrl?: string
) {
  const activeLease = await prisma.lease.findFirst({
    where: { userId, isActive: true },
    include: {
      room: {
        select: { number: true },
      },
      user: {
        select: {
          tenantProfile: {
            select: { fullName: true },
          },
        },
      },
    },
  });

  if (!activeLease) {
    throw new Error("Anda tidak memiliki sewa aktif untuk melaporkan kerusakan");
  }

  const report = await prisma.report.create({
    data: {
      leaseId: activeLease.id,
      title,
      description,
      photoUrl: photoUrl || null,
      status: "OPEN",
    },
  });

  // Send notification to all Admin users
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  const tenantName = activeLease.user.tenantProfile?.fullName || "Penghuni";
  const roomNumber = activeLease.room.number;

  const notifyPromises = admins.map((admin) =>
    sendNotification({
      userId: admin.id,
      title: "Laporan Kerusakan Baru",
      message: `Laporan '${title}' diajukan oleh ${tenantName} (Kamar ${roomNumber}).`,
      type: "MAINTENANCE",
      url: "/admin/reports",
    }).catch((err) => log.error({ err }, "Gagal kirim notifikasi laporan ke admin"))
  );

  await Promise.all(notifyPromises);

  return report;
}

/**
 * Change the tenant's password.
 */
export async function changeTenantPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  const passwordsMatch = await bcryptjs.compare(
    currentPassword,
    user.passwordHash
  );

  if (!passwordsMatch) {
    throw new Error("Password saat ini salah");
  }

  const newHash = await bcryptjs.hash(newPassword, 12);

  return prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: newHash,
    },
  });
}

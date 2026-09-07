import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { sendNotification } from "@/features/notifications/notification-service";
import logger from "@/lib/logger";

const log = logger.child({ module: "promo-service" });

// ============================================
// READ QUERIES (Cached)
// ============================================

/**
 * Fetch all pending discount claims for admin review.
 */
export const getPendingDiscountClaims = cache(async () => {
  return unstable_cache(
    async () => {
      return prisma.discountClaim.findMany({
        where: { status: "PENDING" },
        include: {
          invoice: {
            select: {
              id: true,
              dueDate: true,
              amount: true,
              rentAmount: true,
              utilityAmount: true,
              otherAmount: true,
              tenantAdminFee: true,
              discountAmount: true,
              discountReason: true,
              status: true,
              lease: {
                select: {
                  room: {
                    select: { number: true, name: true },
                  },
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              phoneNumber: true,
              tenantProfile: {
                select: { fullName: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    },
    ["pending-discount-claims"],
    { tags: [CACHE_TAGS.DISCOUNT_PRESETS, CACHE_TAGS.ADMIN_TENANTS], revalidate: 30 }
  )();
});

/**
 * Fetch discount claims submitted by a specific tenant.
 */
export const getTenantDiscountClaims = cache(async (userId: string) => {
  return unstable_cache(
    async () => {
      return prisma.discountClaim.findMany({
        where: { userId },
        include: {
          invoice: {
            select: {
              id: true,
              dueDate: true,
              amount: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    },
    [`tenant-discount-claims-${userId}`],
    { tags: [CACHE_TAGS.tenantDashboard(userId)], revalidate: 60 }
  )();
});

// ============================================
// MUTATIONS (No Cache)
// ============================================

/**
 * Tenant submits a promo claim (e.g. Google Review screenshot proof)
 */
export async function submitDiscountClaim(
  userId: string,
  invoiceId: string,
  discountCode: string,
  proofUrl: string,
  googleName?: string
) {
  // 1. Verify invoice exists & belongs to tenant
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      lease: {
        select: { userId: true, room: { select: { number: true } } },
      },
    },
  });

  if (!invoice) {
    throw new Error("Tagihan tidak ditemukan.");
  }

  if (invoice.lease.userId !== userId) {
    throw new Error("Akses ditolak: Tagihan ini bukan milik Anda.");
  }

  if (invoice.status === "PAID") {
    throw new Error("Tagihan sudah lunas, promo tidak dapat diajukan lagi.");
  }

  // Check if a pending claim already exists for this invoice
  const existingPending = await prisma.discountClaim.findFirst({
    where: {
      invoiceId,
      status: "PENDING",
    },
  });

  if (existingPending) {
    throw new Error(
      "Anda sudah memiliki pengajuan promo yang sedang ditinjau oleh Admin."
    );
  }

  // 2. Create DiscountClaim record
  const claim = await prisma.discountClaim.create({
    data: {
      invoiceId,
      userId,
      discountCode,
      proofUrl,
      googleName: googleName || null,
      status: "PENDING",
    },
  });

  // 3. Notify all Admins about the new promo claim
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  const tenantName =
    (
      await prisma.tenantProfile.findUnique({
        where: { userId },
        select: { fullName: true },
      })
    )?.fullName || "Penghuni";

  const roomNumber = invoice.lease.room.number;

  const notifyPromises = admins.map((admin) =>
    sendNotification({
      userId: admin.id,
      title: "Pengajuan Promo Baru 🎁",
      message: `${tenantName} (Kamar ${roomNumber}) mengajukan promo '${discountCode}'.`,
      type: "BILLING",
      url: "/admin/billing",
    }).catch((err) =>
      log.error({ err }, "Gagal kirim notifikasi promo ke admin")
    )
  );

  await Promise.all(notifyPromises);

  return claim;
}

/**
 * Admin approves a discount claim.
 * Updates claim status to APPROVED, sets Invoice.discountAmount & Invoice.discountReason,
 * and recalculates invoice net amount!
 */
export async function approveDiscountClaim(claimId: string, adminNote?: string) {
  const claim = await prisma.discountClaim.findUnique({
    where: { id: claimId },
    include: {
      invoice: true,
      user: {
        select: {
          id: true,
          tenantProfile: { select: { fullName: true } },
        },
      },
    },
  });

  if (!claim) {
    throw new Error("Pengajuan promo tidak ditemukan.");
  }

  if (claim.status !== "PENDING") {
    throw new Error("Pengajuan promo sudah diproses sebelumnya.");
  }

  // Find preset discount config if available
  const preset = await prisma.discountPreset.findUnique({
    where: { code: claim.discountCode },
  });

  // Default discount amount for Google Review waiver = tenantAdminFee or 2000
  let discountAmount = preset?.amount || 2000;
  if (preset?.type === "ADMIN_FEE_WAIVER" && claim.invoice.tenantAdminFee > 0) {
    discountAmount = claim.invoice.tenantAdminFee;
  }

  const baseAmount =
    claim.invoice.rentAmount +
    claim.invoice.utilityAmount +
    claim.invoice.otherAmount +
    claim.invoice.tenantAdminFee;

  const newNetAmount = Math.max(0, baseAmount - discountAmount);

  // Update claim & invoice in transaction
  const updatedInvoice = await prisma.$transaction(async (tx) => {
    await tx.discountClaim.update({
      where: { id: claimId },
      data: {
        status: "APPROVED",
        adminNote: adminNote || "Disetujui oleh Admin",
      },
    });

    return tx.invoice.update({
      where: { id: claim.invoiceId },
      data: {
        discountAmount,
        discountReason: claim.discountCode,
        amount: newNetAmount,
      },
    });
  });

  // Notify tenant
  sendNotification({
    userId: claim.userId,
    title: "Promo Disetujui! 🎁",
    message: `Pengajuan promo Anda berhasil disetujui. Tagihan terpotong Rp ${discountAmount.toLocaleString(
      "id-ID"
    )}.`,
    type: "BILLING",
    url: "/dashboard/billing",
  }).catch((err) =>
    log.error({ err }, "Gagal kirim notifikasi approve promo ke tenant")
  );

  return updatedInvoice;
}

/**
 * Admin rejects a discount claim.
 */
export async function rejectDiscountClaim(claimId: string, adminNote: string) {
  const claim = await prisma.discountClaim.findUnique({
    where: { id: claimId },
  });

  if (!claim) {
    throw new Error("Pengajuan promo tidak ditemukan.");
  }

  if (claim.status !== "PENDING") {
    throw new Error("Pengajuan promo sudah diproses sebelumnya.");
  }

  const updatedClaim = await prisma.discountClaim.update({
    where: { id: claimId },
    data: {
      status: "REJECTED",
      adminNote,
    },
  });

  // Notify tenant
  sendNotification({
    userId: claim.userId,
    title: "Promo Belum Disetujui",
    message: `Pengajuan promo Anda belum dapat disetujui. Alasan: ${adminNote}`,
    type: "BILLING",
    url: "/dashboard/billing",
  }).catch((err) =>
    log.error({ err }, "Gagal kirim notifikasi reject promo ke tenant")
  );

  return updatedClaim;
}

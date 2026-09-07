"use server";

import { auth } from "@/auth";
import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import logger from "@/lib/logger";
import {
  createPaymentSchema,
  applyDiscountSchema,
} from "./payment-schema";
import {
  createMidtransTransaction,
  applyDiscountToInvoice,
  removeDiscountFromInvoice,
} from "./payment-service";

const log = logger.child({ module: "payment-actions" });

// ============================================
// Tenant: Buat Transaksi Pembayaran Midtrans
// ============================================

export async function createPaymentAction(
  invoiceId: string,
  paymentMethodCode: string
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TENANT") {
    return { success: false, error: "Akses ditolak." };
  }

  const parsed = createPaymentSchema.safeParse({ invoiceId, paymentMethodCode });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const result = await createMidtransTransaction(
      parsed.data.invoiceId,
      parsed.data.paymentMethodCode
    );

    // Invalidate cache agar status tagihan terbaru tampil
    updateTag(CACHE_TAGS.tenantDashboard(session.user.id));
    updateTag(CACHE_TAGS.tenantInvoices(session.user.id));
    updateTag(CACHE_TAGS.DASHBOARD_STATS);
    updateTag(CACHE_TAGS.ADMIN_TENANTS);

    return {
      success: true,
      data: {
        snapToken: result.snapToken,
        paymentUrl: result.paymentUrl,
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal membuat transaksi pembayaran.";
    log.error({ err: error, invoiceId }, "Gagal membuat transaksi Midtrans");
    return { success: false, error: message };
  }
}

// ============================================
// Admin: Terapkan Diskon ke Invoice
// ============================================

export async function applyDiscountAction(
  invoiceId: string,
  discountPresetCode: string
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak: Memerlukan hak akses Admin." };
  }

  const parsed = applyDiscountSchema.safeParse({ invoiceId, discountPresetCode });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const result = await applyDiscountToInvoice(
      parsed.data.invoiceId,
      parsed.data.discountPresetCode
    );

    // Invalidate cache
    updateTag(CACHE_TAGS.ADMIN_TENANTS);
    updateTag(CACHE_TAGS.DASHBOARD_STATS);

    // Invalidate tenant-specific caches
    const invoice = await import("@/lib/db").then((m) =>
      m.prisma.invoice.findUnique({
        where: { id: invoiceId },
        select: { lease: { select: { userId: true } } },
      })
    );
    if (invoice?.lease?.userId) {
      updateTag(CACHE_TAGS.tenantDashboard(invoice.lease.userId));
      updateTag(CACHE_TAGS.tenantInvoices(invoice.lease.userId));
    }

    return { success: true, data: result };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal menerapkan diskon.";
    log.error({ err: error, invoiceId, discountPresetCode }, "Gagal apply diskon");
    return { success: false, error: message };
  }
}

// ============================================
// Admin: Hapus Diskon dari Invoice
// ============================================

export async function removeDiscountAction(invoiceId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak: Memerlukan hak akses Admin." };
  }

  try {
    await removeDiscountFromInvoice(invoiceId);

    updateTag(CACHE_TAGS.ADMIN_TENANTS);
    updateTag(CACHE_TAGS.DASHBOARD_STATS);

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal menghapus diskon.";
    log.error({ err: error, invoiceId }, "Gagal hapus diskon");
    return { success: false, error: message };
  }
}

// ============================================
// Tenant / Admin: Batalkan Pembayaran (Reset PENDING)
// ============================================

export async function cancelPaymentAction(invoiceId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Akses ditolak: Anda harus login." };
  }

  try {
    const prisma = await import("@/lib/db").then((m) => m.prisma);

    // Fetch the invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        lease: {
          select: { userId: true },
        },
      },
    });

    if (!invoice) {
      return { success: false, error: "Tagihan tidak ditemukan." };
    }

    // Role-based security check
    if (session.user.role === "TENANT" && invoice.lease.userId !== session.user.id) {
      return { success: false, error: "Akses ditolak: Tagihan ini bukan milik Anda." };
    }

    if (invoice.status !== "PENDING") {
      return { success: false, error: "Tagihan tidak dalam status PENDING." };
    }

    // Reset payment fields
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "UNPAID",
        snapToken: null,
        paymentUrl: null,
        providerRef: null,
        externalId: null,
        totalAdminFee: 0,
        tenantAdminFee: 0,
        ownerAdminFee: 0,
        amount: invoice.rentAmount + invoice.utilityAmount + invoice.otherAmount - invoice.discountAmount,
      },
    });

    // Invalidate caches
    const tenantUserId = invoice.lease.userId;
    updateTag(CACHE_TAGS.tenantDashboard(tenantUserId));
    updateTag(CACHE_TAGS.tenantInvoices(tenantUserId));
    updateTag(CACHE_TAGS.DASHBOARD_STATS);
    updateTag(CACHE_TAGS.ADMIN_TENANTS);

    return {
      success: true,
      message: "Transaksi pembayaran berhasil dibatalkan. Silakan pilih metode pembayaran baru.",
      data: updatedInvoice,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal membatalkan transaksi.";
    log.error({ err: error, invoiceId }, "Gagal membatalkan transaksi PENDING");
    return { success: false, error: message };
  }
}

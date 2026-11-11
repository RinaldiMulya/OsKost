"use server";

import { auth } from "@/auth";
import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import logger from "@/lib/logger";
import {
  submitDiscountClaim,
  approveDiscountClaim,
  rejectDiscountClaim,
} from "./promo-service";

const log = logger.child({ module: "promo-actions" });

/**
 * Server Action: Tenant submits a promo claim (e.g. Google Review screenshot)
 */
export async function submitPromoClaimAction(
  invoiceId: string,
  discountCode: string,
  proofUrl: string,
  googleName?: string
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TENANT") {
    return { success: false, error: "Akses ditolak." };
  }

  if (!invoiceId || !proofUrl) {
    return { success: false, error: "Bukti screenshot ulasan wajib diunggah." };
  }

  try {
    const result = await submitDiscountClaim(
      session.user.id,
      invoiceId,
      discountCode,
      proofUrl,
      googleName
    );

    // Invalidate caches
    updateTag(CACHE_TAGS.tenantDashboard(session.user.id));
    updateTag(CACHE_TAGS.tenantInvoices(session.user.id));
    updateTag(CACHE_TAGS.ADMIN_TENANTS);
    updateTag(CACHE_TAGS.DISCOUNT_PRESETS);

    return {
      success: true,
      message: "Pengajuan promo berhasil dikirim! Admin akan meninjau ulasan Anda secepatnya.",
      data: result,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal mengajukan promo.";
    log.error({ err: error, invoiceId }, "Gagal submit promo claim");
    return { success: false, error: message };
  }
}

/**
 * Server Action: Admin approves a promo claim
 */
export async function approvePromoClaimAction(
  claimId: string,
  adminNote?: string
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "PROPERTY_OWNER" && session.user.role !== "SUPER_ADMIN")) {
    return { success: false, error: "Akses ditolak: Memerlukan hak akses Admin atau Pemilik Kost." };
  }

  try {
    const result = await approveDiscountClaim(claimId, adminNote);

    revalidatePath("/admin/billing");
    revalidatePath("/admin/tenants");
    updateTag(CACHE_TAGS.ADMIN_TENANTS);
    updateTag(CACHE_TAGS.DASHBOARD_STATS);
    updateTag(CACHE_TAGS.DISCOUNT_PRESETS);

    return {
      success: true,
      message: "Promo berhasil disetujui! Tagihan tenant telah terpotong.",
      data: result,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal menyetujui promo.";
    log.error({ err: error, claimId }, "Gagal approve promo claim");
    return { success: false, error: message };
  }
}

/**
 * Server Action: Admin rejects a promo claim
 */
export async function rejectPromoClaimAction(
  claimId: string,
  adminNote: string
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "PROPERTY_OWNER" && session.user.role !== "SUPER_ADMIN")) {
    return { success: false, error: "Akses ditolak: Memerlukan hak akses Admin atau Pemilik Kost." };
  }

  if (!adminNote) {
    return { success: false, error: "Alasan penolakan wajib diisi." };
  }

  try {
    const result = await rejectDiscountClaim(claimId, adminNote);

    revalidatePath("/admin/billing");
    revalidatePath("/admin/tenants");
    updateTag(CACHE_TAGS.ADMIN_TENANTS);
    updateTag(CACHE_TAGS.DASHBOARD_STATS);
    updateTag(CACHE_TAGS.DISCOUNT_PRESETS);

    return {
      success: true,
      message: "Pengajuan promo berhasil ditolak.",
      data: result,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal menolak promo.";
    log.error({ err: error, claimId }, "Gagal reject promo claim");
    return { success: false, error: message };
  }
}

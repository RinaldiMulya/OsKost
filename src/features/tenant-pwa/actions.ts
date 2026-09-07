"use server";

import { auth } from "@/auth";
import logger from "@/lib/logger";

const log = logger.child({ module: "tenant-pwa-actions" });
import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  uploadPaymentProof,
  createMaintenanceReport,
  changeTenantPassword,
  reportSubmitSchema,
  passwordChangeSchema,
} from "./tenant-pwa-service";

/**
 * Server Action to handle payment proof upload.
 */
export async function uploadPaymentProofAction(
  invoiceId: string,
  proofUrl: string
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TENANT") {
    throw new Error("Unauthorized");
  }

  try {
    const result = await uploadPaymentProof(invoiceId, proofUrl);

    // Invalidate tenant-specific caches
    updateTag(CACHE_TAGS.tenantDashboard(session.user.id));
    updateTag(CACHE_TAGS.tenantInvoices(session.user.id));
    // Also invalidate admin dashboard stats (unpaid invoices count changes)
    updateTag(CACHE_TAGS.DASHBOARD_STATS);
    updateTag(CACHE_TAGS.ADMIN_TENANTS);

    return { success: true, data: result };
  } catch (error: any) {
    log.error({ err: error, invoiceId }, "Gagal upload bukti pembayaran");
    return { success: false, error: error.message || "Gagal mengunggah bukti pembayaran" };
  }
}

/**
 * Server Action to submit maintenance report.
 */
export async function submitMaintenanceReportAction(
  prevState: { success: boolean; error?: string; message?: string } | undefined,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TENANT") {
    return { success: false, error: "Unauthorized" };
  }

  const rawData = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    photoUrl: formData.get("photoUrl") as string || undefined,
  };

  const parsed = reportSubmitSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await createMaintenanceReport(
      session.user.id,
      parsed.data.title,
      parsed.data.description,
      parsed.data.photoUrl
    );

    // Invalidate tenant reports cache
    updateTag(CACHE_TAGS.tenantReports(session.user.id));
    // Invalidate dashboard stats (openReports count changes)
    updateTag(CACHE_TAGS.DASHBOARD_STATS);
    // Invalidate admin reports cache agar laporan baru muncul di dashboard admin
    updateTag(CACHE_TAGS.REPORTS_ALL);
    updateTag(CACHE_TAGS.REPORTS_BY_STATUS("OPEN"));
    revalidatePath("/admin/reports");
    revalidatePath("/dashboard/reports");

    return { success: true, message: "Laporan kerusakan berhasil dikirim!" };
  } catch (error: any) {
    log.error({ err: error, userId: session.user.id }, "Gagal submit laporan kerusakan");
    return { success: false, error: error.message || "Gagal mengirimkan laporan kerusakan" };
  }
}

/**
 * Server Action to change tenant password.
 */
export async function changePasswordAction(
  prevState: { success: boolean; error?: string; message?: string } | undefined,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TENANT") {
    return { success: false, error: "Unauthorized" };
  }

  const rawData = {
    currentPassword: formData.get("currentPassword") as string,
    newPassword: formData.get("newPassword") as string,
  };

  const parsed = passwordChangeSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await changeTenantPassword(
      session.user.id,
      parsed.data.currentPassword,
      parsed.data.newPassword
    );
    return { success: true, message: "Password berhasil diubah!" };
  } catch (error: any) {
    log.error({ err: error, userId: session.user.id }, "Gagal mengubah password tenant");
    return { success: false, error: error.message || "Gagal mengubah password" };
  }
}

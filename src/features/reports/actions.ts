"use server";

import { auth } from "@/auth";
import { updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  adminReportFormSchema,
  updateReportStatusSchema,
  getAllReports,
  getReportsByStatus,
  getReportById,
  getActiveLeases,
  updateReportStatus,
  createAdminReport,
  updateReportPhoto,
  deleteReport,
} from "./report-service";

// ============================================
// Helper: Pastikan user adalah ADMIN
// ============================================

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Akses ditolak: hanya Admin yang diizinkan");
  }
  return session;
}

// ============================================
// Query Actions
// ============================================

/**
 * Ambil semua laporan dengan optional filter status.
 */
export async function getReportsAction(
  status?: "OPEN" | "IN_PROGRESS" | "RESOLVED"
) {
  try {
    await requireAdmin();

    const reports = status
      ? await getReportsByStatus(status)
      : await getAllReports();

    return { success: true as const, data: reports };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal memuat laporan";
    return { success: false as const, error: message };
  }
}

/**
 * Ambil detail laporan berdasarkan ID.
 */
export async function getReportByIdAction(id: string) {
  try {
    await requireAdmin();

    const report = await getReportById(id);
    if (!report) {
      return { success: false as const, error: "Laporan tidak ditemukan" };
    }

    return { success: true as const, data: report };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Gagal memuat detail laporan";
    return { success: false as const, error: message };
  }
}

/**
 * Ambil daftar sewa aktif (untuk dropdown di form admin).
 */
export async function getActiveLeasesAction() {
  try {
    await requireAdmin();
    const leases = await getActiveLeases();
    return { success: true as const, data: leases };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Gagal memuat daftar sewa aktif";
    return { success: false as const, error: message };
  }
}

// ============================================
// Mutation Actions
// ============================================

/**
 * Perbarui status laporan (OPEN → IN_PROGRESS → RESOLVED).
 */
export async function updateReportStatusAction(
  id: string,
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
) {
  try {
    await requireAdmin();

    const parsed = updateReportStatusSchema.safeParse({ id, status });
    if (!parsed.success) {
      return {
        success: false as const,
        error: parsed.error.issues[0].message,
      };
    }

    const updatedReport = await updateReportStatus(parsed.data.id, parsed.data.status);

    // Invalidate cache
    updateTag(CACHE_TAGS.REPORTS_ALL);
    updateTag(CACHE_TAGS.REPORTS_BY_STATUS(parsed.data.status));
    updateTag(CACHE_TAGS.REPORT_BY_ID(parsed.data.id));
    updateTag(CACHE_TAGS.DASHBOARD_STATS);
    // Invalidate cache tenant terkait agar perubahan status terlihat di PWA
    updateTag(CACHE_TAGS.tenantReports(updatedReport.lease.userId));

    return {
      success: true as const,
      message: "Status laporan berhasil diperbarui",
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Gagal memperbarui status laporan";
    return { success: false as const, error: message };
  }
}

/**
 * Buat laporan baru oleh admin atas nama tenant.
 * Menggunakan useActionState pattern (prevState, formData).
 */
export async function createAdminReportAction(
  prevState: { success: boolean; error?: string; message?: string } | undefined,
  formData: FormData
) {
  try {
    await requireAdmin();

    const rawData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      leaseId: formData.get("leaseId") as string,
      photoUrl: (formData.get("photoUrl") as string) || undefined,
      status: (formData.get("status") as string) || "OPEN",
    };

    const parsed = adminReportFormSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false as const,
        error: parsed.error.issues[0].message,
      };
    }

    await createAdminReport({
      title: parsed.data.title,
      description: parsed.data.description,
      photoUrl: parsed.data.photoUrl || undefined,
      status: parsed.data.status,
      leaseId: parsed.data.leaseId,
    });

    // Invalidate cache
    updateTag(CACHE_TAGS.REPORTS_ALL);
    updateTag(CACHE_TAGS.DASHBOARD_STATS);

    return {
      success: true as const,
      message: "Laporan baru berhasil dibuat",
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Gagal membuat laporan";
    return { success: false as const, error: message };
  }
}

/**
 * Perbarui foto laporan (admin upload foto kerusakan).
 */
export async function updateReportPhotoAction(
  reportId: string,
  photoUrl: string
) {
  try {
    await requireAdmin();

    if (!reportId || !photoUrl) {
      return {
        success: false as const,
        error: "ID laporan dan URL foto harus diisi",
      };
    }

    await updateReportPhoto(reportId, photoUrl);

    // Invalidate cache
    updateTag(CACHE_TAGS.REPORT_BY_ID(reportId));
    updateTag(CACHE_TAGS.REPORTS_ALL);

    return {
      success: true as const,
      message: "Foto laporan berhasil diperbarui",
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Gagal memperbarui foto laporan";
    return { success: false as const, error: message };
  }
}

/**
 * Hapus laporan.
 */
export async function deleteReportAction(reportId: string) {
  try {
    await requireAdmin();
    
    // Check if report exists and get lease info for tenant cache invalidation
    const report = await getReportById(reportId);
    if (!report) {
      return { success: false as const, error: "Laporan tidak ditemukan" };
    }

    await deleteReport(reportId);

    // Invalidate cache
    updateTag(CACHE_TAGS.REPORTS_ALL);
    updateTag(CACHE_TAGS.DASHBOARD_STATS);
    updateTag(CACHE_TAGS.tenantReports(report.lease.user.id));

    return {
      success: true as const,
      message: "Laporan berhasil dihapus",
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menghapus laporan";
    return { success: false as const, error: message };
  }
}
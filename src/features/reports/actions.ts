"use server";

import { auth } from "@/auth";
import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { prisma } from "@/lib/db";
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
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "PROPERTY_OWNER" && session.user.role !== "SUPER_ADMIN")) {
    throw new Error("Akses ditolak: hanya Admin atau Pemilik Kost yang diizinkan");
  }
  return session;
}

/**
 * Helper untuk memusnahkan seluruh cache laporan (Admin & Tenant)
 */
function invalidateAllReportCaches(userId?: string, reportId?: string) {
  updateTag(CACHE_TAGS.REPORTS_ALL);
  updateTag(CACHE_TAGS.REPORTS_BY_STATUS("OPEN"));
  updateTag(CACHE_TAGS.REPORTS_BY_STATUS("IN_PROGRESS"));
  updateTag(CACHE_TAGS.REPORTS_BY_STATUS("RESOLVED"));
  updateTag(CACHE_TAGS.DASHBOARD_STATS);
  if (reportId) {
    updateTag(CACHE_TAGS.REPORT_BY_ID(reportId));
  }
  if (userId) {
    updateTag(CACHE_TAGS.tenantReports(userId));
  }
  revalidatePath("/admin/reports");
  revalidatePath("/admin");
  revalidatePath("/dashboard/reports");
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
    const session = await requireAdmin();
    const propertyId = session.user.propertyId;

    const reports = status
      ? await getReportsByStatus(status, propertyId)
      : await getAllReports(propertyId);

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
    const session = await requireAdmin();
    const leases = await getActiveLeases(session.user.propertyId);
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

    // Invalidate cache secara menyeluruh
    invalidateAllReportCaches(updatedReport.lease.userId, parsed.data.id);

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

    const newReport = await createAdminReport({
      title: parsed.data.title,
      description: parsed.data.description,
      photoUrl: parsed.data.photoUrl || undefined,
      status: parsed.data.status,
      leaseId: parsed.data.leaseId,
    });

    // Invalidate cache
    invalidateAllReportCaches(undefined, newReport.id);

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
    invalidateAllReportCaches(undefined, reportId);

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
 * Hapus laporan (dengan pengecekan DB langsung untuk menghindari error jika sudah terhapus di DB).
 */
export async function deleteReportAction(reportId: string) {
  try {
    await requireAdmin();
    
    // Cek langsung ke database (tanpa cache) untuk mendapatkan info lease/user
    const existingReport = await prisma.report.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        lease: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!existingReport) {
      // Jika data sudah tidak ada di DB (misal terhapus sebelumnya),
      // tetap bersihkan cache agar UI otomatis ter-update dan tidak menampilkan data hantu.
      invalidateAllReportCaches(undefined, reportId);
      return {
        success: true as const,
        message: "Laporan sudah tidak ada di database dan telah dibersihkan dari tampilan",
      };
    }

    await deleteReport(reportId);

    // Invalidate cache seluruhnya
    invalidateAllReportCaches(existingReport.lease.userId, reportId);

    return {
      success: true as const,
      message: "Laporan berhasil dihapus",
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal menghapus laporan";
    return { success: false as const, error: message };
  }
}
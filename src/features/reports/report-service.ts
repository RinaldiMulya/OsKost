import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { sendNotification } from "@/features/notifications/notification-service";
import logger from "@/lib/logger";

const log = logger.child({ module: "report-service" });

// ============================================
// Zod Schemas untuk validasi
// ============================================

export const reportFormSchema = z.object({
  title: z.string().min(1, "Judul laporan wajib diisi"),
  description: z.string().min(5, "Deskripsi laporan minimal 5 karakter"),
  photoUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).default("OPEN"),
});

// Untuk form admin yang membuat laporan atas nama tenant
export const adminReportFormSchema = reportFormSchema.extend({
  leaseId: z.string().min(1, "Pilih tenant/lease"),
});

// Untuk validasi update status
export const updateReportStatusSchema = z.object({
  id: z.string().min(1, "ID laporan wajib diisi"),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]),
});

// ============================================
// Types
// ============================================

export interface ReportForAdmin {
  id: string;
  title: string;
  description: string;
  category: string;
  location?: string | null;
  preferredTime?: string | null;
  photos: string[];
  photoUrl: string | null;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  scheduledAt?: Date | null;
  scheduleLabel?: string | null;
  progress?: number;
  resolvedByName?: string | null;
  resolutionNote?: string | null;
  createdAt: Date;
  updatedAt: Date;
  lease: {
    id: string;
    user: {
      id: string;
      tenantProfile: {
        fullName: string;
      } | null;
    };
    room: {
      number: string;
      name: string;
      property: {
        name: string;
      };
    };
  };
}

export interface ActiveLeaseForSelect {
  id: string;
  userId: string;
  tenantName: string;
  roomNumber: string;
  roomName: string;
}

// ============================================
// Service Queries (Cached)
// ============================================

/**
 * Ambil semua laporan keluhan untuk admin.
 * Menggunakan select agar hanya mengambil field yang dibutuhkan.
 */
export const getAllReports = cache(async (): Promise<ReportForAdmin[]> => {
  return unstable_cache(
    async () => {
      const reports = await prisma.report.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          location: true,
          preferredTime: true,
          photos: true,
          photoUrl: true,
          status: true,
          scheduledAt: true,
          scheduleLabel: true,
          progress: true,
          resolvedByName: true,
          resolutionNote: true,
          createdAt: true,
          updatedAt: true,
          lease: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  tenantProfile: {
                    select: {
                      fullName: true,
                    },
                  },
                },
              },
              room: {
                select: {
                  number: true,
                  name: true,
                  property: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return reports as unknown as ReportForAdmin[];
    },
    ["reports-all"],
    { tags: [CACHE_TAGS.REPORTS_ALL], revalidate: 3 }
  )();
});

/**
 * Ambil laporan keluhan berdasarkan status tertentu.
 */
export const getReportsByStatus = cache(
  async (status: "OPEN" | "IN_PROGRESS" | "RESOLVED"): Promise<ReportForAdmin[]> => {
    return unstable_cache(
      async () => {
        const reports = await prisma.report.findMany({
          where: { status },
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            location: true,
            preferredTime: true,
            photos: true,
            photoUrl: true,
            status: true,
            scheduledAt: true,
            scheduleLabel: true,
            progress: true,
            resolvedByName: true,
            resolutionNote: true,
            createdAt: true,
            updatedAt: true,
            lease: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    tenantProfile: {
                      select: {
                        fullName: true,
                      },
                    },
                  },
                },
                room: {
                  select: {
                    number: true,
                    name: true,
                    property: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
        return reports as unknown as ReportForAdmin[];
      },
      [`reports-status-${status}`],
      { tags: [CACHE_TAGS.REPORTS_BY_STATUS(status)], revalidate: 3 }
    )();
  }
);

/**
 * Ambil detail satu laporan berdasarkan ID.
 */
export const getReportById = cache(
  async (id: string): Promise<ReportForAdmin | null> => {
    return unstable_cache(
      async () => {
        const report = await prisma.report.findUnique({
          where: { id },
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            location: true,
            preferredTime: true,
            photos: true,
            photoUrl: true,
            status: true,
            scheduledAt: true,
            scheduleLabel: true,
            progress: true,
            resolvedByName: true,
            resolutionNote: true,
            createdAt: true,
            updatedAt: true,
            lease: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    tenantProfile: {
                      select: {
                        fullName: true,
                      },
                    },
                  },
                },
                room: {
                  select: {
                    number: true,
                    name: true,
                    property: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
        return report as unknown as ReportForAdmin | null;
      },
      [`report-${id}`],
      { tags: [CACHE_TAGS.REPORT_BY_ID(id)], revalidate: 3 }
    )();
  }
);

/**
 * Ambil semua sewa (lease) aktif beserta info tenant dan kamar.
 * Digunakan di form admin untuk memilih tenant saat membuat laporan baru.
 */
export const getActiveLeases = cache(
  async (): Promise<ActiveLeaseForSelect[]> => {
    return unstable_cache(
      async () => {
        const leases = await prisma.lease.findMany({
          where: { isActive: true },
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                tenantProfile: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
            room: {
              select: {
                number: true,
                name: true,
              },
            },
          },
          orderBy: {
            user: {
              tenantProfile: {
                fullName: "asc",
              },
            },
          },
        });

        return leases.map((lease) => ({
          id: lease.id,
          userId: lease.userId,
          tenantName:
            lease.user.tenantProfile?.fullName || "Tanpa Nama",
          roomNumber: lease.room.number,
          roomName: lease.room.name,
        }));
      },
      ["active-leases-for-reports"],
      { tags: [CACHE_TAGS.ADMIN_TENANTS] }
    )();
  }
);

// ============================================
// Service Mutations
// ============================================

/**
 * Perbarui status laporan dan kirim notifikasi ke tenant.
 */
export async function updateReportStatus(
  id: string,
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
) {
  const updatedReport = await prisma.report.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      title: true,
      status: true,
      lease: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (updatedReport?.lease?.userId) {
    const statusLabels: Record<string, string> = {
      OPEN: "Terbuka",
      IN_PROGRESS: "Sedang Diproses",
      RESOLVED: "Selesai",
    };

    const statusText = statusLabels[status] || status;

    await sendNotification({
      userId: updatedReport.lease.userId,
      title: "Status Laporan Diperbarui",
      message: `Laporan '${updatedReport.title}' Anda telah diubah statusnya menjadi ${statusText}.`,
      type: "MAINTENANCE",
      url: "/dashboard/reports",
    }).catch((err: unknown) => log.error({ err }, "Gagal kirim notifikasi laporan ke tenant"));
  }

  return updatedReport;
}

/**
 * Buat laporan baru oleh admin atas nama tenant.
 * Admin memilih lease secara langsung (bukan userId).
 */
export async function createAdminReport(data: {
  title: string;
  description: string;
  photoUrl?: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  leaseId: string;
}) {
  // Verifikasi lease ada
  const lease = await prisma.lease.findUnique({
    where: { id: data.leaseId },
    select: { id: true, isActive: true },
  });

  if (!lease) {
    throw new Error("Lease tidak ditemukan");
  }

  return prisma.report.create({
    data: {
      title: data.title,
      description: data.description,
      photoUrl: data.photoUrl || null,
      status: data.status,
      leaseId: data.leaseId,
    },
  });
}

/**
 * Perbarui foto laporan.
 */
export async function updateReportPhoto(reportId: string, photoUrl: string) {
  return prisma.report.update({
    where: { id: reportId },
    data: { photoUrl },
  });
}

/**
 * Hapus laporan beserta fotonya dari database (safe delete, no crash if missing).
 */
export async function deleteReport(reportId: string) {
  return prisma.report.deleteMany({
    where: { id: reportId },
  });
}
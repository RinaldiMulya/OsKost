import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/api-auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const authUser = await getAuthenticatedUser(req);
        if (!authUser) {
            return apiError("UNAUTHORIZED", "Sesi login tidak valid", 401);
        }

        const { id: reportId } = await params;

        const report = await prisma.report.findUnique({
            where: { id: reportId },
            include: {
                lease: {
                    include: {
                        room: {
                            select: {
                                id: true,
                                number: true,
                                name: true,
                            },
                        },
                        user: {
                            select: {
                                id: true,
                                tenantProfile: {
                                    select: { fullName: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!report) {
            return apiError("NOT_FOUND", "Laporan tidak ditemukan", 404);
        }

        if (authUser.role === "TENANT" && report.lease.userId !== authUser.id) {
            return apiError("FORBIDDEN", "Anda tidak memiliki akses ke laporan ini", 403);
        }

        return apiSuccess({
            id: report.id,
            title: report.title,
            description: report.description,
            status: report.status,
            category: report.category,
            location: report.location,
            preferredTime: report.preferredTime,
            photos: report.photos,
            scheduledAt: report.scheduledAt,
            scheduleLabel: report.scheduleLabel,
            progress: report.progress,
            resolvedByName: report.resolvedByName,
            resolutionNote: report.resolutionNote,
            room: report.lease.room,
            tenantName: report.lease.user.tenantProfile?.fullName || "Penghuni Kost",
            createdAt: report.createdAt,
            updatedAt: report.updatedAt,
        });
    } catch (error) {
        console.error("[API_REPORT_DETAIL_ERROR]", error);
        return apiError("INTERNAL_ERROR", "Gagal memuat rincian laporan", 500);
    }
}

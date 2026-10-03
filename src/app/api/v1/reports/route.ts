import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { ReportStatus } from "@prisma/client";

const createReportSchema = z.object({
    title: z.string().min(3, "Judul laporan minimal 3 karakter").max(100),
    description: z.string().min(5, "Deskripsi minimal 5 karakter").max(1000),
    category: z.string().default("Kamar Mandi"),
    location: z.string().max(100).optional().nullable(),
    preferredTime: z.string().max(50).optional().nullable(),
    photos: z.array(z.string()).max(3, "Maksimal 3 foto pendukung").default([]),
});

export async function GET(req: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(req);
        if (!authUser) {
            return apiError("UNAUTHORIZED", "Sesi login tidak valid", 401);
        }

        const { searchParams } = new URL(req.url);
        const statusParam = searchParams.get("status")?.toUpperCase();
        const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
        const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

        const whereClause: Record<string, unknown> = {};

        if (authUser.role === "TENANT") {
            whereClause.lease = {
                userId: authUser.id,
            };
        } else if (authUser.propertyId) {
            whereClause.propertyId = authUser.propertyId;
        }

        if (statusParam && Object.values(ReportStatus).includes(statusParam as ReportStatus)) {
            whereClause.status = statusParam as ReportStatus;
        }

        const [reports, total] = await Promise.all([
            prisma.report.findMany({
                where: whereClause,
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
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip: offset,
                take: limit,
            }),
            prisma.report.count({ where: whereClause }),
        ]);

        return apiSuccess(
            reports.map((rep) => ({
                id: rep.id,
                title: rep.title,
                description: rep.description,
                status: rep.status,
                category: rep.category,
                location: rep.location,
                preferredTime: rep.preferredTime,
                photos: rep.photos,
                scheduledAt: rep.scheduledAt,
                scheduleLabel: rep.scheduleLabel,
                progress: rep.progress,
                resolvedByName: rep.resolvedByName,
                resolutionNote: rep.resolutionNote,
                roomNumber: rep.lease.room.number,
                createdAt: rep.createdAt,
                updatedAt: rep.updatedAt,
            })),
            {
                total,
                limit,
                offset,
            }
        );
    } catch (error) {
        console.error("[API_REPORTS_GET_ERROR]", error);
        return apiError("INTERNAL_ERROR", "Gagal memuat daftar laporan", 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(req);
        if (!authUser) {
            return apiError("UNAUTHORIZED", "Sesi login tidak valid", 401);
        }

        const body = await req.json().catch(() => null);
        const parsed = createReportSchema.safeParse(body);

        if (!parsed.success) {
            return apiError(
                "VALIDATION_ERROR",
                parsed.error.issues[0]?.message || "Data laporan tidak valid",
                400,
                parsed.error.format()
            );
        }

        // Cari sewa aktif untuk tenant ini
        const activeLease = await prisma.lease.findFirst({
            where: {
                userId: authUser.id,
                isActive: true,
            },
        });

        if (!activeLease) {
            return apiError(
                "NO_ACTIVE_LEASE",
                "Anda tidak memiliki status hunian aktif untuk membuat laporan keluhan.",
                400
            );
        }

        const { title, description, category, location, preferredTime, photos } = parsed.data;

        const newReport = await prisma.report.create({
            data: {
                title,
                description,
                category,
                location: location || null,
                preferredTime: preferredTime || "bebas",
                photos,
                photoUrl: photos[0] || null,
                status: "OPEN",
                leaseId: activeLease.id,
                propertyId: activeLease.propertyId,
            },
        });

        return apiSuccess(
            {
                id: newReport.id,
                title: newReport.title,
                description: newReport.description,
                status: newReport.status,
                category: newReport.category,
                location: newReport.location,
                preferredTime: newReport.preferredTime,
                photos: newReport.photos,
                createdAt: newReport.createdAt,
            },
            undefined,
            201
        );
    } catch (error) {
        console.error("[API_REPORTS_POST_ERROR]", error);
        return apiError("INTERNAL_ERROR", "Gagal mengirim laporan keluhan", 500);
    }
}

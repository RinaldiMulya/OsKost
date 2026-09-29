import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/api-auth";

const patchNotificationSchema = z.object({
    id: z.string().optional(),
    all: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(req);
        if (!authUser) {
            return apiError("UNAUTHORIZED", "Sesi login tidak valid", 401);
        }

        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");
        const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
        const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

        const whereClause: Record<string, unknown> = {
            userId: authUser.id,
        };

        if (category && category !== "all") {
            whereClause.category = category;
        }

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where: whereClause,
                orderBy: { createdAt: "desc" },
                skip: offset,
                take: limit,
            }),
            prisma.notification.count({ where: whereClause }),
            prisma.notification.count({
                where: {
                    userId: authUser.id,
                    isRead: false,
                },
            }),
        ]);

        return apiSuccess(
            notifications.map((n) => ({
                id: n.id,
                title: n.title,
                message: n.message,
                type: n.type,
                isRead: n.isRead,
                category: n.category,
                tag: n.tag,
                extraNote: n.extraNote,
                actionLabel: n.actionLabel,
                actionUrl: n.actionUrl,
                createdAt: n.createdAt,
            })),
            {
                total,
                unreadCount,
                limit,
                offset,
            }
        );
    } catch (error) {
        console.error("[API_NOTIFICATIONS_GET_ERROR]", error);
        return apiError("INTERNAL_ERROR", "Gagal memuat notifikasi", 500);
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(req);
        if (!authUser) {
            return apiError("UNAUTHORIZED", "Sesi login tidak valid", 401);
        }

        const body = await req.json().catch(() => ({}));
        const parsed = patchNotificationSchema.safeParse(body);

        if (!parsed.success) {
            return apiError("VALIDATION_ERROR", "Data tidak valid", 400);
        }

        const { id, all } = parsed.data;

        if (all) {
            await prisma.notification.updateMany({
                where: {
                    userId: authUser.id,
                    isRead: false,
                },
                data: {
                    isRead: true,
                },
            });

            return apiSuccess({ message: "Semua notifikasi ditandai sudah dibaca" });
        }

        if (id) {
            await prisma.notification.updateMany({
                where: {
                    id,
                    userId: authUser.id,
                },
                data: {
                    isRead: true,
                },
            });

            return apiSuccess({ message: "Notifikasi ditandai sudah dibaca" });
        }

        return apiError("VALIDATION_ERROR", "Parameter id atau all wajib diisi", 400);
    } catch (error) {
        console.error("[API_NOTIFICATIONS_PATCH_ERROR]", error);
        return apiError("INTERNAL_ERROR", "Gagal memperbarui status notifikasi", 500);
    }
}
